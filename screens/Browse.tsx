import React from "react";
import { FlatList, View } from "react-native";
import { ActivityIndicator, IconButton, Text, useTheme } from "react-native-paper";
import CardItemLikes from "../components/CardItemLikes";
import * as Global from "../Global";
import * as URL from "../URL";
import {
  SearchDto,
  SearchParams,
  SearchParamsSortE,
  SearchResource,
  UnitsEnum,
  UserDto,
} from "../myTypes";
import { STATUS_BAR_HEIGHT } from "../assets/styles";

const Browse = () => {
  const { colors } = useTheme();
  const [results, setResults] = React.useState<UserDto[]>([]);
  const [currentUser, setCurrentUser] = React.useState<UserDto>();
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  async function load(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const profileResponse = await Global.Fetch(URL.API_RESOURCE_YOUR_PROFILE);
      const profileResource: SearchResource = profileResponse.data;
      const user = profileResource.user;
      setCurrentUser(user);

      const storedLatitude = await Global.GetStorage(Global.STORAGE_LATITUDE);
      const storedLongitude = await Global.GetStorage(Global.STORAGE_LONGITUDE);
      const latitude = storedLatitude ? Number(storedLatitude) : user.locationLatitude;
      const longitude = storedLongitude ? Number(storedLongitude) : user.locationLongitude;

      const paramsStorage = await Global.GetStorage(Global.STORAGE_ADV_SEARCH_PARAMS);
      const storedParams: SearchParams = paramsStorage ? JSON.parse(paramsStorage) : {};

      const searchParams: SearchParams = {
        distance: storedParams.distance ?? Global.DEFAULT_DISTANCE,
        showOutsideParameters: storedParams.showOutsideParameters ?? true,
        sort: SearchParamsSortE.ACTIVE_DATE,
        latitude,
        longitude,
        miscInfos: storedParams.miscInfos ?? [],
        intentions: storedParams.intentions ?? [],
        interests: storedParams.interests ?? [],
        preferredMinAge: storedParams.preferredMinAge,
        preferredMaxAge: storedParams.preferredMaxAge,
        preferredGenderIds:
          storedParams.preferredGenderIds ?? user.preferedGenders.map((gender) => gender.id),
      };

      const searchResponse = await Global.Fetch(URL.API_SEARCH, "post", searchParams);
      const searchResult: SearchDto = searchResponse.data;
      setResults(searchResult.users ?? []);
    } catch (error) {
      console.error(error);
      Global.ShowToast("Could not load people. Check your server connection.");
      setResults([]);
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
      <View
        style={{
          paddingTop: STATUS_BAR_HEIGHT + 8,
          paddingHorizontal: 14,
          paddingBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text variant="headlineSmall">Browse</Text>
          <Text variant="bodySmall" style={{ opacity: 0.65 }}>
            People near your preferences
          </Text>
        </View>
        <IconButton
          icon="tune-variant"
          onPress={() => Global.navigate(Global.SCREEN_PROFILE_SEARCHSETTINGS, false, {})}
        />
      </View>

      {loading && results.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={results}
          numColumns={2}
          keyExtractor={(item) => item.uuid}
          refreshing={refreshing}
          onRefresh={() => load(true)}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24, flexGrow: 1 }}
          columnWrapperStyle={{ justifyContent: "space-around" }}
          renderItem={({ item }) => (
            <CardItemLikes
              user={item}
              unitsImperial={currentUser?.units === UnitsEnum.IMPERIAL}
              tapEnabled={true}
            />
          )}
          ListEmptyComponent={
            <View style={{ flex: 1, padding: 36, alignItems: "center", justifyContent: "center" }}>
              <Text variant="titleMedium">No profiles found</Text>
              <Text style={{ textAlign: "center", opacity: 0.65, marginTop: 8 }}>
                Pull to refresh or widen your search preferences.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default Browse;
