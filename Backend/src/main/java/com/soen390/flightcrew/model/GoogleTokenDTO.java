package com.soen390.flightcrew.model;

public record GoogleTokenDTO(
    String accessToken,
    String refreshToken,
    Long expiresIn
) {}
