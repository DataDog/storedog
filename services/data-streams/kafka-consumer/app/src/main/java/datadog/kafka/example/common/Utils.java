package datadog.kafka.example.common;

import java.time.LocalDateTime;

public class Utils {

    public static int getEnvInt(String name, int defaultVal) {
        String value = System.getenv(name);
        if (value == null || value.isEmpty()) {
            return defaultVal;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return defaultVal;
        }
    }

    public static int getEnvInt(String name) {
        return getEnvInt(name, 0);
    }

    public static String getEnvString(String name, String defaultVal) {
        String value = System.getenv(name);
        return (value == null || value.isEmpty()) ? defaultVal : value;
    }

    public static boolean getEnvBoolean(String name, boolean defaultVal) {
        String value = System.getenv(name);
        if (value == null || value.isEmpty()) {
            return defaultVal;
        }
        return Boolean.parseBoolean(value);
    }

    public static boolean isEven(int val) {
        return (val % 2) == 0;
    }

    public static boolean isEvenDateTime(LocalDateTime dateTime) {
        int currentHour = dateTime.getHour();
        int currentDay = dateTime.getDayOfMonth();

        boolean isDayEven = isEven(currentDay);
        boolean isHourEven = isEven(currentHour);

        return isDayEven ? isHourEven : !isHourEven;
    }

    public static String createCustomSizeMsg(int msgSize) {
        StringBuilder sb = new StringBuilder(msgSize);
        for (int i = 0; i < msgSize; i++) {
            sb.append('a');
        }
        return sb.toString();
    }
}