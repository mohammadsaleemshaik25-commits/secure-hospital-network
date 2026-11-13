package com.hospital.network.service;

import com.hospital.network.dto.*;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
class TcpServiceTest {

    private final TcpService service = new TcpService();

    @Test
    void handshakeSuccess() {
        TcpConnectRequest req = new TcpConnectRequest(5000, 6000, 0.0);
        TcpConnectResponse resp = service.connect(req);
        assertThat(resp.getState()).isEqualTo("ESTABLISHED");
        assertThat(resp.getEventLog()).containsExactly("SYN", "SYN-ACK", "ACK");
        assertThat(resp.getConnectionId()).isNotBlank();
    }

    @Test
    void invalidPort() {
        TcpConnectRequest req = new TcpConnectRequest(0, 6000, 0.0);
        assertThatThrownBy(() -> service.connect(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("srcPort");
    }

    @Test
    void successfulDataTransmission() {
        TcpConnectResponse conn = service.connect(new TcpConnectRequest(5001, 6001, 0.0));
        TcpDataRequest dataReq = new TcpDataRequest(conn.getConnectionId(), "hello", 0.0, null);
        TcpDataResponse resp = service.send(dataReq);
        assertThat(resp.isRetransmissionRequired()).isFalse();
        assertThat(resp.getTotalBytesSent()).isEqualTo(5L);
        assertThat(resp.getAckNumber()).isEqualTo(5L);
    }

    @Test
    void retransmissionAfterLoss() {
        TcpConnectResponse conn = service.connect(new TcpConnectRequest(5002, 6002, 0.0));
        TcpDataRequest dataReq = new TcpDataRequest(conn.getConnectionId(), "world", 1.0, 2);
        TcpDataResponse resp = service.send(dataReq);
        assertThat(resp.isRetransmissionRequired()).isTrue();
        // All attempts lost, so no bytes sent
        assertThat(resp.getTotalBytesSent()).isEqualTo(0L);
        TcpStatusResponse status = service.status(conn.getConnectionId());
        assertThat(status.getLostPackets()).isGreaterThan(0);
        assertThat(status.getRetransmissions()).isGreaterThan(0);
    }

    @Test
    void connectionTermination() {
        TcpConnectResponse conn = service.connect(new TcpConnectRequest(5003, 6003, 0.0));
        TcpCloseResponse closeResp = service.close(new TcpCloseRequest(conn.getConnectionId()));
        assertThat(closeResp.getFinalState()).isEqualTo("CLOSED");
        // after close, status should throw
        assertThatThrownBy(() -> service.status(conn.getConnectionId()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void statisticsAfterMultipleSends() {
        TcpConnectResponse conn = service.connect(new TcpConnectRequest(5004, 6004, 0.0));
        // first successful send
        service.send(new TcpDataRequest(conn.getConnectionId(), "abc", 0.0, null));
        // second lost send
        service.send(new TcpDataRequest(conn.getConnectionId(), "def", 1.0, 1));
        TcpStatusResponse status = service.status(conn.getConnectionId());
        assertThat(status.getSentBytes()).isEqualTo(3L); // only first succeeded (3 bytes)
        assertThat(status.getLostPackets()).isEqualTo(1);
        assertThat(status.getRetransmissions()).isEqualTo(1);
    }
}

