package com.amory.util;

import java.io.IOException;

public class AudioFileUtilTest {
    static String testFile="C:\\Users\\ChengXX\\Desktop\\4B64163D39C83DF84F7686D1AAF88EB877794AF0F3EB335DB9CE3292B7F4ACB0.wav";
    public static void main(String[] args) throws IOException {
        System.out.println("每秒字节数(字节):"+AudioFileUtil.getBytesPerSeconds(testFile));
        System.out.println("帧大小(字节):"+AudioFileUtil.getAudioFrameSize(testFile));
        System.out.println("文件长度(字节):"+AudioFileUtil.getByteLength(testFile));
        System.out.println("每秒帧大小(帧)-Sample Rate:"+AudioFileUtil.getFrameRate(testFile));
        System.out.println("采样比特位数(bits)-Sample Size:"+AudioFileUtil.getSampleSizeInBits(testFile));
        System.out.println("文件长度(秒):"+AudioFileUtil.computeLength(testFile));
        System.out.println("通道:"+AudioFileUtil.getChannels(testFile));
        System.out.println("编码方式:"+AudioFileUtil.getEncoding(testFile));

        System.out.println("文件前100个字节:"+AudioFileUtil.getAudioByteHeader(testFile));
    }
}
