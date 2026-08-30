import React from "react";
import { Share, View } from "react-native";
import { Button, Card, Text, TextInput, useTheme } from "react-native-paper";
import { STATUS_BAR_HEIGHT } from "../assets/styles";
import { VIDEO_BASE_URL } from "../config/runtime";
import { buildRoomUrl, createRandomRoom, openVideoRoom } from "../lib/videoCall";
import * as Global from "../Global";

const Cam2Cam = () => {
  const { colors } = useTheme();
  const [room, setRoom] = React.useState(createRandomRoom());
  const [joining, setJoining] = React.useState(false);

  async function joinRoom() {
    if (!room.trim() || joining) return;
    setJoining(true);
    try {
      await openVideoRoom(room);
    } catch (error) {
      console.error(error);
      Global.ShowToast("Could not open the video room.");
    } finally {
      setJoining(false);
    }
  }

  async function shareInvite() {
    if (!room.trim()) return;
    try {
      const url = buildRoomUrl(room);
      await Share.share({
        title: "Video room invite",
        message: `Join my video room: ${url}`,
        url,
      });
    } catch (error) {
      console.error(error);
      Global.ShowToast("Could not share the room invite.");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 }}>
      <View style={{ paddingTop: STATUS_BAR_HEIGHT + 8, paddingBottom: 16 }}>
        <Text variant="headlineSmall">Cam2Cam</Text>
        <Text variant="bodySmall" style={{ opacity: 0.65 }}>
          Video rooms without a coin or VIP gate
        </Text>
      </View>

      <Card>
        <Card.Content>
          <Text variant="titleMedium">Room code</Text>
          <Text variant="bodyMedium" style={{ marginTop: 6, opacity: 0.75 }}>
            Create a room, share the invite, then both people join the same code. A room code is
            not a password, so do not post it publicly.
          </Text>

          <TextInput
            mode="outlined"
            label="Room code"
            value={room}
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setRoom}
            style={{ marginTop: 16 }}
          />

          <Button
            mode="contained"
            icon="video"
            loading={joining}
            disabled={joining || !room.trim()}
            onPress={joinRoom}
            style={{ marginTop: 14 }}
          >
            Join video room
          </Button>

          <Button
            mode="outlined"
            icon="refresh"
            onPress={() => setRoom(createRandomRoom())}
            style={{ marginTop: 10 }}
          >
            New room
          </Button>

          <Button
            mode="text"
            icon="share-variant"
            disabled={!room.trim()}
            onPress={shareInvite}
            style={{ marginTop: 6 }}
          >
            Share invite
          </Button>
        </Card.Content>
      </Card>

      <Card style={{ marginTop: 14 }}>
        <Card.Content>
          <Text variant="titleSmall">Video provider</Text>
          <Text variant="bodySmall" style={{ marginTop: 4, opacity: 0.7 }}>
            {VIDEO_BASE_URL}
          </Text>
          <Text variant="bodySmall" style={{ marginTop: 8, opacity: 0.7 }}>
            The default opens Jitsi in a browser session. For production control, point
            EXPO_PUBLIC_VIDEO_BASE_URL to a Jitsi deployment whose authentication, logging and
            retention settings you have reviewed.
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
};

export default Cam2Cam;
