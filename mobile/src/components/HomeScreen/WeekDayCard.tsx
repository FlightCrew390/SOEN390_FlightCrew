import { Text, TouchableOpacity } from "react-native";
import styles from "../../styles/Calendar";

interface WeekDayCardProps {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  dayLetter: string;
  onPress: () => void;
}

export default function WeekDayCard({
  date,
  isSelected,
  isToday,
  dayLetter,
  onPress,
}: Readonly<WeekDayCardProps>) {
  return (
    <TouchableOpacity
      style={[
        styles.dayCard,
        isSelected && styles.dayCardSelected,
        !isSelected && isToday && styles.dayCardCurrent,
      ]}
      onPress={onPress}
      testID={`day-${date.getDate()}`}
    >
      <Text
        style={[
          styles.dayDate,
          isSelected && styles.dayDateSelected,
          !isSelected && isToday && styles.dayDateCurrent,
        ]}
      >
        {date.getDate()}
      </Text>
      <Text
        style={[
          styles.dayLetter,
          isSelected && styles.dayLetterSelected,
          !isSelected && isToday && styles.dayLetterCurrent,
        ]}
      >
        {dayLetter}
      </Text>
    </TouchableOpacity>
  );
}
