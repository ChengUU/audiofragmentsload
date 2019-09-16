package com.amory.controller;

import com.amory.service.AudioInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

import javax.servlet.http.HttpServletRequest;

@RestController
public class AudioInfoController {
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private AudioInfoService audioInfoService;
    @GetMapping("test/audioinfo/{audio_id}")
    public ResponseEntity getAudioInfo(@PathVariable int audio_id){
        return ResponseEntity.ok(audioInfoService.getAudioInfo(audio_id));
    }

    @GetMapping("test/api/audio/{audio_id}")
    public ResponseEntity audioLoad(@PathVariable int audio_id){
        String str=request.getHeader("Range");
        System.out.println(str);
        return ResponseEntity.ok(new byte[1024]);
    }
}
