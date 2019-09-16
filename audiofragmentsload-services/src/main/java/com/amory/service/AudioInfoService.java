package com.amory.service;

import com.amory.com.amory.vo.AudioInfo;
import com.amory.util.AudioFileUtil;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Service
public class AudioInfoService {
    private static Map<Integer,String> CACHE_MAP=new HashMap<>();

    @PostConstruct
    public void init(){
        CACHE_MAP.put(1,"C:\\Users\\Agilephotonics\\Desktop\\4B64163D39C83DF84F7686D1AAF88EB877794AF0F3EB335DB9CE3292B7F4ACB0.wav");
    }

    public AudioInfo getAudioInfo(final Integer id){
        final String audioPath=CACHE_MAP.get(id);
        AudioInfo audioInfo=AudioInfo.builder()
                .channels(AudioFileUtil.getChannels(audioPath))
                .encoding(AudioFileUtil.getEncoding(audioPath))
                .duration(AudioFileUtil.computeLength(audioPath))
                .sampleRate(AudioFileUtil.getFrameRate(audioPath))
                .sampleSizeInBits(AudioFileUtil.getSampleSizeInBits(audioPath))
                .size(AudioFileUtil.getByteLength(audioPath))
                .frameSize(AudioFileUtil.getAudioFrameSize(audioPath))
                .build();
        return audioInfo;
    }
}
