import React from "react";
import { FlatList, Image, Pressable, View } from "react-native";
import { ActivityIndicator, Card, Text, useTheme } from "react-native-paper";
import { AlertsResource, NotificationDto } from "../myTypes";
import * as Global from "../Global";
import * as URL from "../URL";
import { STATUS_BAR_HEIGHT } from "../assets/styles";

function formatActivityDate(value: Date | string | number): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

const Social = () => {
  const { colors } = useTheme();
  const [items, setItems] = React.useState<NotificationDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await Global.Fetch(URL.API_RESOURCE_ALERTS);
      const data: AlertsResource = response.data;
      setItems(data.notifications ?? []);
    } catch (error) {
      console.error(error);
      Global.ShowToast("Could not load social activity.");
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: STATUS_BAR_HEIGHT + 8, paddingHorizontal: 16, paddingBottom: 12 }}>
        <Text variant="headlineSmall">Social</Text>
        <Text variant="bodySmall" style={{ opacity: 0.65 }}>
          Likes, matches and activity from your community
        </Text>
      </View>

      {loading && items.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          refreshing={refreshing}
          onRefresh={() => load(true)}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24, flexGrow: 1 }}
          renderItem={({ item }) => (
            <Pressable onPress={() => Global.nagivateProfile(item.userFromDto, item.userFromDto.uuid)}>
              <Card style={{ marginBottom: 10 }}>
                <Card.Content style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={{ uri: item.userFromDto.profilePicture || undefined }}
                    style={{ width: 58, height: 58, borderRadius: 29, marginRight: 12 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium">
                      {item.userFromDto.firstName}, {item.userFromDto.age}
                    </Text>
                    <Text variant="bodyMedium" style={{ marginTop: 2 }}>
                      {item.message || "New activity"}
                    </Text>
                    <Text variant="bodySmall" style={{ marginTop: 4, opacity: 0.55 }}>
                      {formatActivityDate(item.date)}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 36 }}>
              <Text variant="titleMedium">No activity yet</Text>
              <Text style={{ textAlign: "center", marginTop: 8, opacity: 0.65 }}>
                New likes and match activity will appear here.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default Social;
