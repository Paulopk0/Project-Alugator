import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";

const Tab = createBottomTabNavigator();

const HomeScreen = ({ navigation }) => {
  return (
    <>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
      </Tab.Navigator>
    </>
  );
}

export default HomeScreen;