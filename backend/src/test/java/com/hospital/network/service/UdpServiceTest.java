package com.hospital.network.service;

import com.hospital.network.dto.UdpSendRequest;
import com.hospital.network.dto.UdpSendResponse;
import com.hospital.network.dto.UdpStatsResponse;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
class UdpServiceTest {

    private final UdpService service = new UdpService();

    @Test
    void successfulDeliveryProbabilityZero() {
        UdpSendRequest req = new UdpSendRequest(4000, 5000, "payload", 0.0, "clientA");
        UdpSendResponse resp = service.send(req);
        assertThat(resp.isDelivered()).isTrue();
        // stats should show one sent and one delivered
        UdpStatsResponse stats = service.stats("clientA");
        assertThat(stats.getSentPackets()).isEqualTo(1);
        assertThat(stats.getDeliveredPackets()).isEqualTo(1);
        assertThat(stats.getLostPackets()).isZero();
    }

    @Test
    void packetLossProbabilityOne() {
        UdpSendRequest req = new UdpSendRequest(4001, 5001, "payload", 1.0, "clientB");
        UdpSendResponse resp = service.send(req);
        assertThat(resp.isDelivered()).isFalse();
        UdpStatsResponse stats = service.stats("clientB");
        assertThat(stats.getSentPackets()).isEqualTo(1);
        assertThat(stats.getDeliveredPackets()).isZero();
        assertThat(stats.getLostPackets()).isEqualTo(1);
    }

    @Test
    void perClientStatisticsMultipleSends() {
        // clientC will send 3 packets: two with loss=0, one with loss=1
        UdpSendRequest r1 = new UdpSendRequest(4002, 5002, "p1", 0.0, "clientC");
        UdpSendRequest r2 = new UdpSendRequest(4003, 5003, "p2", 0.0, "clientC");
        UdpSendRequest r3 = new UdpSendRequest(4004, 5004, "p3", 1.0, "clientC");
        service.send(r1);
        service.send(r2);
        service.send(r3);
        UdpStatsResponse stats = service.stats("clientC");
        assertThat(stats.getSentPackets()).isEqualTo(3);
        assertThat(stats.getDeliveredPackets()).isEqualTo(2);
        assertThat(stats.getLostPackets()).isEqualTo(1);
    }
}

