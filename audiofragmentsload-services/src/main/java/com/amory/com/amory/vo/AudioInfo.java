package com.amory.com.amory.vo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

/**
 * 音频信息
 * @author chengxx
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
@ToString
@Builder
public class AudioInfo {
    /** 比特率 */
    private float bitRate;
    /** 轨道 */
    private int channels;
    /** 音频长度 */
    private float duration;
    /** 音频格式 */
    private String encoding;
    /** 采样率 */
    private float sampleRate;
    private long sampleSizeInBits;
    /** 总字节数 */
    private long size;
}
