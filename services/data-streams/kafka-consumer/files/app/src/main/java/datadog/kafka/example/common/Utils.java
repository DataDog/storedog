package datadog.kafka.example.consumer;

import java.time.LocalDateTime;

public class Utils {

  public static int getEnvInt(String name, int defaultVal) {
    String value = System.getenv(name);
    return value == null || value.isEmpty() ? defaultVal : Integer.parseInt(value);
  }

  public static int getEnvInt(String name) {
    return getEnvInt(name, 0);
  }

  public static boolean isEven(int val) {
    return (val % 2) == 0;
  }

  public static boolean isEvenDateTime(LocalDateTime dateTime) {
    // Returns 0 to 23.
    int currentHour = dateTime.getHour();
    // Returns 1 to 31.
    int currentDay = dateTime.getDayOfMonth();

    boolean isDayEven = isEven(currentDay);
    boolean isHourEven = isEven(currentHour);

    // Some examples:
    // On the 27th, at 2PM, we have: currentDay: 27, currentHour: 14. shouldCrash => false.
    // On the 27th, at 3PM, we have: currentDay: 27, currentHour: 15. shouldCrash => true.
    // On the 28th, at 2PM, we have: currentDay: 28, currentHour: 14. shouldCrash => true.
    // On the 28th, at 2PM, we have: currentDay: 28, currentHour: 15. shouldCrash => false.
    return isDayEven ? isHourEven : !isHourEven;
  }

  public static String createCustomSizeMsg(int msgSize) {
    StringBuilder sb = new StringBuilder(msgSize);
    for (int i=0; i<msgSize; i++) {
      sb.append('a');
    }
    return sb.toString();
  }
}