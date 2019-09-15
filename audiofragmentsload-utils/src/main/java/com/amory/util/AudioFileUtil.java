package com.amory.util;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.sound.sampled.AudioFileFormat;
import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.UnsupportedAudioFileException;
import java.io.File;
import java.io.IOException;

/**
 * 音频文件工具类：获取音频文件长度
 *
 * @author chengxx
 */
public class AudioFileUtil {
    private static Logger logger= LoggerFactory.getLogger(AudioFileUtil.class);

    /**
     * 获取音频文件格式化对象
     * @param srcFile 音频文件
     * @return The {@link AudioFormat} object of srcFile
     * @throws IOException
     * @throws UnsupportedAudioFileException
     */
    public static AudioFormat getAudioFormat(final String srcFile) throws IOException, UnsupportedAudioFileException {
            // 加载文件至内存
            File file = new File(srcFile);
            // 获取音频文件格式
            AudioFileFormat fileFormat = AudioSystem.getAudioFileFormat(file);
            AudioFormat format = fileFormat.getFormat();
            return format;
    }

    /**
     * 音频文件格式
     * @param srcFile 音频文件
     * @return The {@link AudioFileFormat} Object.
     * @throws IOException
     * @throws UnsupportedAudioFileException
     */
    public static AudioFileFormat getAudioFileFormat(final String srcFile) throws IOException, UnsupportedAudioFileException {
        // 加载文件至内存
        File file = new File(srcFile);
        // 获取音频文件格式
        AudioFileFormat fileFormat = AudioSystem.getAudioFileFormat(file);
        return fileFormat;
    }

    /**
     * 计算音频长度
     *
     * @param srcFile 音频文件
     * @return The length of audio file {@param srcFile} with seconds.
     */
    public static double computeLength(final String srcFile) {
        double countTime = Constants.DOUBLE_ZERO;
        try {
            // 加载文件至内存
            File file = new File(srcFile);
            // 获取音频文件格式
            AudioFileFormat fileFormat = AudioSystem.getAudioFileFormat(file);
            fileFormat.getByteLength();
            fileFormat.getFrameLength();
            fileFormat.getType();
            AudioFormat format = fileFormat.getFormat();
            format.getChannels();
            format.getEncoding();
            format.getSampleSizeInBits();
            // 每秒多少个byte
            float bytesPerSecond = format.getFrameSize() * format.getFrameRate();
            // 文件总长度
            countTime = fileFormat.getByteLength() / bytesPerSecond;
            return countTime;
        } catch (Exception e) {
            logger.warn(String.format("Getting the length of %s failed",srcFile));
            return countTime;
        }
    }

    /**
     * 获取音频文件字节大小
     * @param srcFile 音频文件
     * @return the byte length of audio file
     */
    public static int getByteLength(final String srcFile){
        int byteLength=0;
        try {
            // 加载文件至内存
            File file = new File(srcFile);
            // 获取音频文件格式
            AudioFileFormat fileFormat = AudioSystem.getAudioFileFormat(file);
            byteLength=fileFormat.getByteLength();
        }catch (UnsupportedAudioFileException e) {
            logger.warn(String.format("Getting the byte length of audio file %s failed. error: %s",srcFile,e.getMessage()));
            e.printStackTrace();
        } catch (IOException e) {
            logger.warn(String.format("Getting the byte length of audio file %s failed. error: %s",srcFile,e.getMessage()));
            e.printStackTrace();
        }
        finally {
            return byteLength;
        }
    }

    /**
     * Getting the frame size of audio file with bytes
     * @param srcFile
     * @return the number of bytes per frame - bytes/frame
     */
    public static int getAudioFrameSize(final String srcFile){
        int frameSize = Constants.INTEHER_ZERO;
        try {
            // 获取音频文件格式
            AudioFormat format = getAudioFormat(srcFile);
            // 文件总长度
            frameSize =format.getFrameSize() ;
            return frameSize;
        } catch (Exception e) {
            logger.warn(String.format("Getting the frame size of %s per frame failed",srcFile));
            return frameSize;
        }
    }

    /**
     * Getting the frame rate of audio file
     * @param srcFile 音频文件
     * @return The frame rate of audio file, the number of frames per second - frames/second
     */
    public static float getFrameRate(final String srcFile){
        float frameRate = Constants.FLOAT_ZERO;
        try {
            // 获取音频文件格式
            AudioFormat format = getAudioFormat(srcFile);
            // 文件总长度
            frameRate =format.getFrameRate() ;
            return frameRate;
        } catch (Exception e) {
            logger.warn(String.format("Getting the frame rate of %s failed",srcFile));
            return frameRate;
        }
    }

    /**
     * Getting the bits of per sample
     * @param srcFile 音频文件
     * @return the number of bits in each sample - bits/sample
     */
    public static int getSampleSizeInBits(final String srcFile){
        int frameRate = Constants.INTEHER_ZERO;
        try {
            // 获取音频文件格式
            AudioFormat format = getAudioFormat(srcFile);
            // 文件总长度
            frameRate =format.getSampleSizeInBits() ;
            return frameRate;
        } catch (Exception e) {
            logger.warn(String.format("Getting the frame rate of %s failed",srcFile));
            return frameRate;
        }
    }

    /**
     * Getting the bytes of audio file per second
     * @param srcFile audio file path
     * @return the bytes of audio file per second - bytes/second
     */
    public static double getBytesPerSeconds(final String srcFile){
        // 每一帧有多少字节
        int framesInBytes=getAudioFrameSize(srcFile);
        // 每秒钟采集多少帧
        float frameRate=getFrameRate(srcFile);
        if(frameRate==Constants.FLOAT_ZERO){
            return Constants.DOUBLE_ZERO;
        }
        return framesInBytes*frameRate;
    }
}

