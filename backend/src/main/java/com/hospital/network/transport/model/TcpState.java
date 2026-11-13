package com.hospital.network.transport.model;

public enum TcpState {
    CLOSED,
    SYN_SENT,
    SYN_RECEIVED,
    ESTABLISHED,
    FIN_WAIT_1,
    FIN_WAIT_2,
    TIME_WAIT
}
