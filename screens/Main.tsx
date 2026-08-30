import React from "react";
import {
  Browse,
  Cam2Cam,
  Messages,
  Search,
  Social,
  YourProfile,
} from "../screens";
import * as Global from "../Global";
import * as URL from "../URL";
import * as I18N from "../i18n";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NAVIGATION_BAR_HEIGHT } from "../assets/styles";
import { useWindowDimensions } from "react-native";
import { RootStackParamList, UserDto, YourProfileResource } from "../myTypes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "react-native-paper";
import { StackScreenProps } from "@react-navigation/stack";

const Tab = createBottomTabNavigator();
const i18n = I18N.getI18n();
const ICON_SIZE = 24;
const SECOND_MS = 1000;
const POLL_ALERT = 15 * SECOND_MS;
const POLL_MESSAGE = 15 * SECOND_MS;
const MOBILE_WIDTH = 768;

const SCREEN_BROWSE = "Browse";
const SCREEN_SOCIAL = "Social";
const SCREEN_CAM2CAM = "Cam2Cam";

const YourProfileScreen: React.FC<any> = (props) => <YourProfile {...props} />;
const MessagesScreen: React.FC<any> = (props) => <Messages {...props} />;
const SearchScreen: React.FC<any> = (props) => <Search {...props} />;
const BrowseScreen: React.FC<any> = (props) => <Browse {...props} />;
const SocialScreen: React.FC<any> = (props) => <Social {...props} />;
const Cam2CamScreen: React.FC<any> = (props) => <Cam2Cam {...props} />;

type Props = StackScreenProps<RootStackParamList, "Main">;

const Main = ({ navigation: _navigation }: Props) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [newAlert, setNewAlert] = React.useState(false);
  const [newMessage, setHasNewMessage] = React.useState(false);
  const [incompleteProfile, setIncompleteProfile] = React.useState(false);

  async function updateNewAlert() {
    try {
      const langIso = i18n.locale.slice(0, 2);
      const response = await Global.Fetch(Global.format(URL.USER_STATUS_ALERT_LANG, langIso));
      setNewAlert(Boolean(response.data));
    } catch (error) {
      console.error(error);
    }
  }

  async function updateNewMessage() {
    try {
      const response = await Global.Fetch(URL.USER_STATUS_MESSAGE);
      setHasNewMessage(Boolean(response.data));
    } catch (error) {
      console.error(error);
    }
  }

  async function checkProfileIncomplete() {
    try {
      const response = await Global.Fetch(URL.API_RESOURCE_YOUR_PROFILE);
      const data: YourProfileResource = response.data;
      const user: UserDto = data.user;
      setIncompleteProfile(
        user.interests.length === 0 || user.images.length === 0 || user.prompts.length === 0
      );
    } catch (error) {
      console.error(error);
    }
  }

  React.useEffect(() => {
    updateNewAlert();
    updateNewMessage();
    checkProfileIncomplete();
    Global.SetStorage(Global.STORAGE_SCREEN, SCREEN_BROWSE);

    const alertInterval = setInterval(updateNewAlert, POLL_ALERT);
    const messageInterval = setInterval(updateNewMessage, POLL_MESSAGE);

    return () => {
      clearInterval(alertInterval);
      clearInterval(messageInterval);
    };
  }, []);

  function saveScreen(screen: string) {
    Global.SetStorage(Global.STORAGE_SCREEN, screen);
  }

  return (
    <Tab.Navigator
      initialRouteName={SCREEN_BROWSE}
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: NAVIGATION_BAR_HEIGHT,
          marginBottom: insets.bottom,
          paddingTop: width >= MOBILE_WIDTH ? 0 : 8,
        },
        tabBarLabelStyle: {
          fontSize: width < 390 ? 8 : 10,
        },
        tabBarBadgeStyle: {
          backgroundColor: "red",
          minWidth: 8,
          height: 8,
        },
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
      }}
    >
      <Tab.Screen
        name={SCREEN_BROWSE}
        component={BrowseScreen}
        listeners={{ tabPress: () => saveScreen(SCREEN_BROWSE) }}
        options={{
          tabBarLabel: "Browse",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-search-outline" color={color} size={ICON_SIZE} />
          ),
        }}
      />

      <Tab.Screen
        name={Global.SCREEN_SEARCH}
        component={SearchScreen}
        listeners={{ tabPress: () => saveScreen(Global.SCREEN_SEARCH) }}
        options={{
          tabBarLabel: "Swipe",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="gesture-swipe-horizontal" color={color} size={ICON_SIZE} />
          ),
        }}
      />

      <Tab.Screen
        name={SCREEN_SOCIAL}
        component={SocialScreen}
        listeners={{ tabPress: () => saveScreen(SCREEN_SOCIAL) }}
        options={{
          tabBarBadge: newAlert ? "" : undefined,
          tabBarLabel: "Social",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-group-outline" color={color} size={ICON_SIZE} />
          ),
        }}
      />

      <Tab.Screen
        name={SCREEN_CAM2CAM}
        component={Cam2CamScreen}
        listeners={{ tabPress: () => saveScreen(SCREEN_CAM2CAM) }}
        options={{
          tabBarLabel: "Cam2Cam",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="video-outline" color={color} size={ICON_SIZE} />
          ),
        }}
      />

      <Tab.Screen
        name={Global.SCREEN_CHAT}
        component={MessagesScreen}
        listeners={{ tabPress: () => saveScreen(Global.SCREEN_CHAT) }}
        options={{
          tabBarBadge: newMessage ? "" : undefined,
          tabBarLabel: "DMs",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="message-text-outline" color={color} size={ICON_SIZE} />
          ),
        }}
      />

      <Tab.Screen
        name={Global.SCREEN_YOURPROFILE}
        component={YourProfileScreen}
        listeners={{ tabPress: () => saveScreen(Global.SCREEN_YOURPROFILE) }}
        options={{
          tabBarBadge: incompleteProfile ? "" : undefined,
          tabBarLabel: "Me",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-circle-outline" color={color} size={ICON_SIZE} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default Main;
