import React from "react";
import {
  View,
  RefreshControl,
  KeyboardAvoidingView,
  Keyboard,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Card, IconButton, TextInput, useTheme, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Autolink, { CustomMatcher } from "react-native-autolink";
import {
  MessageDtoListModel,
  MessageDto,
  RootStackParamList,
  YourProfileResource,
} from "../myTypes";
import styles from "../assets/styles";
import * as Global from "../Global";
import * as URL from "../URL";
import * as I18N from "../i18n";
import { StackScreenProps } from "@react-navigation/stack";
import { createPeerRoom, openVideoRoom } from "../lib/videoCall";

const i18n = I18N.getI18n();
const SECOND_MS = 1000;
const POLL_MESSAGE = 5 * SECOND_MS;

type Props = StackScreenProps<RootStackParamList, "MessageDetail">;

const MessageDetail = ({ route, navigation }: Props) => {
  const { conversation } = route.params;
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [refreshing] = React.useState(false);
  const [results, setResults] = React.useState<MessageDto[]>([]);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [text, setText] = React.useState("");
  const [videoBusy, setVideoBusy] = React.useState(false);
  const messageUpdateInterval = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const PhoneMatcher: CustomMatcher = {
    pattern:
      /(?<=^|\s|\.)[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{0,6}(?=$|\s|\.)/gm,
    type: "phone-intl",
    getLinkUrl: ([number]) => `tel:${number}`,
  };

  async function startVideoCall() {
    if (videoBusy) return;
    setVideoBusy(true);
    try {
      const response = await Global.Fetch(URL.API_RESOURCE_YOUR_PROFILE);
      const data: YourProfileResource = response.data;
      const room = createPeerRoom(data.user.uuid, conversation.uuid);
      await openVideoRoom(room);
    } catch (error) {
      console.error(error);
      Global.ShowToast("Unable to start the video call.");
    } finally {
      setVideoBusy(false);
    }
  }

  React.useEffect(() => {
    navigation.setOptions({
      title: conversation.userName,
      headerRight: () => (
        <IconButton
          icon="video-outline"
          loading={videoBusy}
          disabled={videoBusy}
          onPress={startVideoCall}
        />
      ),
    });
  }, [navigation, conversation.userName, conversation.uuid, videoBusy]);

  React.useEffect(() => {
    load();
    messageUpdateInterval.current = setInterval(() => {
      reloadMessages(false);
    }, POLL_MESSAGE);

    return () => {
      if (messageUpdateInterval.current) {
        clearInterval(messageUpdateInterval.current);
        messageUpdateInterval.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    scrollToEnd();
  }, [results]);

  function scrollToEnd() {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd();
    }, 100);
  }

  async function load() {
    await reloadMessages(true);
  }

  async function reloadMessages(first: boolean) {
    try {
      const firstVal = first ? "1" : "0";
      const response = await Global.Fetch(
        Global.format(URL.API_MESSAGE_UPDATE, conversation.id, firstVal)
      );
      const data: MessageDtoListModel = response.data;
      if (data.list) setResults(data.list);
    } catch (error) {
      console.error(error);
    }
  }

  async function sendMessage() {
    const textCopy = text.trim();
    if (!textCopy) return;

    setText("");
    Keyboard.dismiss();
    try {
      await Global.Fetch(
        Global.format(URL.MESSAGE_SEND, conversation.id),
        "post",
        textCopy,
        "text/plain"
      );
      await reloadMessages(false);
    } catch (error) {
      console.error(error);
      Global.ShowToast("Message could not be sent.");
      setText(textCopy);
    }
  }

  const styleYourChat = {
    color: "white",
    backgroundColor: colors.primary,
  };

  const styleChat = {
    marginLeft: 4,
    marginRight: 4,
    marginBottom: 6,
    padding: 10,
    borderRadius: 10,
    maxWidth: width * 0.85,
  };

  return (
    <View
      style={[
        styles.containerMessages,
        { paddingHorizontal: 0, display: "flex", marginBottom: insets.bottom },
      ]}
    >
      <ScrollView
        style={{ padding: 8, flex: 1 }}
        ref={scrollViewRef}
        contentContainerStyle={{ paddingBottom: 8 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
      >
        {results.map((item) => (
          <View
            key={item.id}
            style={[
              { flex: 1 },
              item.from ? { alignItems: "flex-start" } : { alignItems: "flex-end" },
            ]}
          >
            <Card style={[styleChat, item.from ? {} : styleYourChat]}>
              <Autolink
                style={item.from ? {} : styleYourChat}
                text={item.content}
                linkStyle={{ textDecorationLine: "underline" }}
                email={false}
                phone={true}
                matchers={[PhoneMatcher]}
                component={Text}
              />
            </Card>
          </View>
        ))}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <TextInput
          style={{ backgroundColor: colors.surface, height: 52 }}
          value={text}
          dense={true}
          maxLength={Global.MAX_MESSAGE_LENGTH}
          onChangeText={setText}
          onSubmitEditing={sendMessage}
          placeholder={i18n.t("chat.placeholder")}
          right={
            <TextInput.Icon
              color={colors.secondary}
              onPress={sendMessage}
              icon="send"
            />
          }
        />
      </KeyboardAvoidingView>
    </View>
  );
};

export default MessageDetail;
