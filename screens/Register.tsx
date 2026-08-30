import React from "react";
import {
  ActivityIndicator,
  Button,
  HelperText,
  RadioButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Localization from "expo-localization";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DatePickerInput } from "react-native-paper-dates";
import { ValidRangeType } from "react-native-paper-dates/lib/typescript/Date/Calendar";
import { useHeaderHeight } from "@react-navigation/elements";
import { StackScreenProps } from "@react-navigation/stack";
import * as Global from "../Global";
import * as URL from "../URL";
import * as I18N from "../i18n";
import { RegisterBody, RootStackParamList } from "../myTypes";
import Alert from "../components/Alert";
import VerticalView from "../components/VerticalView";

const i18n = I18N.getI18n();
const MIN_AGE = 18;
const MAX_AGE = 100;

function subtractYears(years: number): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date;
}

type Props = StackScreenProps<RootStackParamList, "Register">;

const Register = ({ route }: Props) => {
  const { height, width } = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const { colors } = useTheme();
  const registerEmail = route.params?.registerEmail;
  const scrollRef = React.useRef<ScrollView | null>(null);

  const validDobRange: ValidRangeType = {
    startDate: subtractYears(MAX_AGE),
    endDate: subtractYears(MIN_AGE),
  };

  const [alertVisible, setAlertVisible] = React.useState(false);
  const [email, setEmail] = React.useState<string>();
  const [emailValid, setEmailValid] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [passwordSecure, setPasswordSecure] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [dob, setDob] = React.useState<Date>();
  const [gender, setGender] = React.useState("1");
  const [referrerCode, setReferrerCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const age = Global.calcAge(dob);
  const ageValid = age >= MIN_AGE && age <= MAX_AGE;

  const alertButtons = [
    {
      text: i18n.t("ok"),
      onPress: () => {
        setAlertVisible(false);
        Global.navigate("Login");
      },
    },
  ];

  const style = StyleSheet.create({
    link: {
      color: colors.primary,
      flex: 1,
    },
    container: {
      marginBottom: 4,
    },
  });

  React.useEffect(() => {
    Global.GetStorage(Global.STORAGE_FIRSTNAME).then((name) => {
      setFirstName(name ? String(name) : "");
    });
  }, []);

  async function submit() {
    const credentialsValid = !registerEmail || (emailValid && passwordSecure);
    if (!firstName || !dob || !ageValid || !credentialsValid) {
      scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      if (dob && !ageValid) Global.ShowToast("OpenCircle registration is for adults 18+.");
      return;
    }

    const data: RegisterBody = {
      dateOfBirth: dob,
      firstName,
      gender: Number(gender),
      privacy: true,
      termsConditions: true,
      referrerCode,
    };

    if (registerEmail) {
      data.email = email;
      data.password = password;
    }

    try {
      setLoading(true);
      if (registerEmail) {
        await Global.Fetch(URL.REGISTER, "post", data);
        setAlertVisible(true);
      } else {
        await Global.Fetch(URL.REGISTER_OAUTH, "post", data);
        await Global.SetStorage(Global.STORAGE_PAGE, Global.INDEX_ONBOARDING);
        Global.loadPage(Global.INDEX_ONBOARDING);
      }
    } catch (error) {
      console.error(error);
      Global.ShowToast(i18n.t("error.generic"));
    } finally {
      setLoading(false);
    }
  }

  function updatePassword(value: string) {
    setPassword(value);
    setPasswordSecure(Global.isPasswordSecure(value));
  }

  function getDateInputLocale(): string {
    const [locale] = Localization.getLocales();
    return locale.languageTag.startsWith("de") ? "de" : "en-GB";
  }

  return (
    <View style={{ height: height - headerHeight }}>
      {loading && (
        <View
          style={{
            height,
            width,
            zIndex: 1,
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
          }}
        >
          <ActivityIndicator animating size="large" />
        </View>
      )}

      <VerticalView ref={scrollRef}>
        <Text style={{ textAlign: "center", marginBottom: 12, fontSize: 32 }}>
          {i18n.t("register.subtitle")}
        </Text>
        <Text style={{ textAlign: "center", marginBottom: 24, opacity: 0.7 }}>
          Adults 18+ only
        </Text>

        {registerEmail && (
          <View style={style.container}>
            <TextInput
              mode="outlined"
              label={i18n.t("email") + " *"}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setEmailValid(Global.isEmailValid(value));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {!emailValid && email ? (
              <HelperText type="error">{i18n.t("email-invalid")}</HelperText>
            ) : null}
          </View>
        )}

        {registerEmail && (
          <View style={style.container}>
            <TextInput
              mode="outlined"
              label={i18n.t("password")}
              value={password}
              autoCapitalize="none"
              onChangeText={updatePassword}
              autoCorrect={false}
              secureTextEntry
            />
            {!passwordSecure && password ? (
              <HelperText type="error">{i18n.t("register-password-warning")}</HelperText>
            ) : null}
          </View>
        )}

        <View style={style.container}>
          <TextInput
            mode="outlined"
            label={i18n.t("first-name") + " *"}
            value={firstName}
            onChangeText={setFirstName}
            maxLength={30}
            autoCorrect={false}
          />
        </View>

        <SafeAreaProvider>
          <View style={style.container}>
            <DatePickerInput
              mode="outlined"
              style={{ backgroundColor: colors.background }}
              locale={getDateInputLocale()}
              label={i18n.t("dob") + " *"}
              value={dob}
              onChange={(value) => {
                if (value) setDob(value);
              }}
              inputMode="start"
              validRange={validDobRange}
            />
            {ageValid ? (
              <HelperText type="info">
                {Global.format(i18n.t("register.age-subtitle"), age.toString())}
              </HelperText>
            ) : null}
          </View>
        </SafeAreaProvider>

        <View style={style.container}>
          <TextInput
            mode="outlined"
            value={referrerCode}
            label={`${i18n.t("register.referral-code")} (${i18n.t("optional")})`}
            onChangeText={setReferrerCode}
            style={{ backgroundColor: colors.background }}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={{ marginBottom: 12 }} />

        <View style={style.container}>
          <Text>{i18n.t("register.gender")} *</Text>
          <RadioButton.Group onValueChange={setGender} value={gender}>
            <RadioButton.Item
              label={i18n.t("gender.male")}
              value="1"
              style={{ flexDirection: "row-reverse" }}
            />
            <RadioButton.Item
              label={i18n.t("gender.female")}
              value="2"
              style={{ flexDirection: "row-reverse" }}
            />
            <RadioButton.Item
              label={i18n.t("gender.other")}
              value="3"
              style={{ flexDirection: "row-reverse" }}
            />
          </RadioButton.Group>
        </View>

        <View style={{ marginBottom: 24 }} />

        <Text
          style={{ marginBottom: 8 }}
          onPress={() => WebBrowser.openBrowserAsync(URL.TOS)}
        >
          {i18n.t("register.agree")}
        </Text>
        <Text style={style.link} onPress={() => WebBrowser.openBrowserAsync(URL.TOS)}>
          {i18n.t("tos")}
        </Text>
        <Text style={style.link} onPress={() => WebBrowser.openBrowserAsync(URL.PRIVACY)}>
          {i18n.t("privacy-policy")}
        </Text>

        <View style={{ marginBottom: 24 }} />
        <View style={style.container}>
          <Text style={{ fontSize: 12, color: "orange" }}>
            {i18n.t("register.asterisk-warning")}
          </Text>
        </View>
        <Button mode="contained" onPress={submit} style={{ marginBottom: 48 }}>
          <Text style={{ color: "white" }}>{i18n.t("register.title")}</Text>
        </Button>
      </VerticalView>

      <Alert
        visible={alertVisible}
        setVisible={setAlertVisible}
        message={i18n.t("register-email-success")}
        buttons={alertButtons}
      />
    </View>
  );
};

export default Register;
