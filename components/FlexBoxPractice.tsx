import { View, StyleSheet } from "react-native";

function Box({ color }: { color: string }) {
  return <View style={[styles.box, { backgroundColor: color }]} />;
}

export default function FlexboxPractice() {
  return (
    <View style={styles.screen}>
      
      <View style={[styles.row, { justifyContent: "space-evenly" }]}>
        <Box color="#4F46E5" />
        <Box color="#F59E0B" />
        <Box color="#16A34A" />
      </View>

      <View style={[styles.row, { justifyContent: "flex-end" }]}>
        <Box color="#4F46E5" />
        <Box color="#F59E0B" />
        <Box color="#16A34A" />
      </View>

      <View style={[styles.row, { justifyContent: "center", gap: 10 }]}>
        <Box color="#4F46E5" />
        <Box color="#F59E0B" />
        <Box color="#16A34A" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "space-around",
    paddingVertical: 40,
  },
  row: {
    flexDirection: "row", 
    alignItems: "center",
  },
  box: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
});