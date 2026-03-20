package com.soen390.flightcrew.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class IndoorAssetFileDTO {
    private String fileName;
    private String downloadUrl;
}
