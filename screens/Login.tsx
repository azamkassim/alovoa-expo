import React from "react";
import {
  Button,
  Divider,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Buffer } from "buffer";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import * as Global from "../Global";
import * as URL from "../URL";
import * as I18N from "../i18n";
import { Captcha, RootStackParamList } from "../myTypes";
import VerticalView from "../components/VerticalView";
import { STATUS_BAR_HEIGHT, WIDESCREEN_HORIZONTAL_MAX } from "../assets/styles";
import splash from "../assets/splash.png";
import Modal from "react-native-modal";
import { StackScreenProps } from "@react-navigation/stack";
import { API_BASE_URL, APP_NAME, IS_ALOVOA_PRODUCTION } from "../config/runtime";

const i18n = I18N.getI18n();
const APP_URL = Linking.createURL("");
const IMAGE_HEADER = "data:image/webp;base64,";

WebBrowser.maybeCompleteAuthSession();

type Props = StackScreenProps<RootStackParamList, "Login">;

const Login = ({ navigation: _navigation }: Props) => {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();

  const [email, setEmail] = React.useState("");
  const [emailValid, setEmailValid] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [captchaId, setCaptchaId] = React.useState(0);
  const [captchaImage, setCaptchaImage] = React.useState("");
  const [captchaText, setCaptchaText] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [captchaVisible, setCaptchaVisible] = React.useState(false);

  function calcMarginModal() {
    return width < WIDESCREEN_HORIZONTAL_MAX + 12 ? 12 : width / 5 + 12;
  }

  const containerStyle = {
    backgroundColor: colors.background,
    padding: 24,
    marginHorizontal: calcMarginModal(),
    borderRadius: 8,
  };

  React.useEffect(() => {
    load();
  }, []);

  const handleRedirect = async (event: { url: string }) => {
    if (Platform.OS === "ios") {
      WebBrowser.dismissBrowser();
    }

    const data = Linking.parse(event.url);
    if (data.queryParams != null) {
      const firstName = String(data.queryParams["firstName"]);
      const page = String(data.queryParams["page"]);
      const sessionId = String(data.queryParams["jsessionid"]);
      const rememberMe = String(data.queryParams["remember-me"]);

      await Global.Fetch(Global.format(URL.AUTH_COOKIE, rememberMe, sessionId));
      await Global.SetStorage(Global.STORAGE_FIRSTNAME, firstName);
      await Global.SetStorage(Global.STORAGE_PAGE, page);
      await Global.SetStorage(Global.STORAGE_LOGIN_DATE, new Date().toISOString());
      Global.loadPage(page);
    }
  };

  async function load() {
    try {
      const value = await Global.GetStorage(Global.STORAGE_PAGE);
      if (value && value !== Global.INDEX_REGISTER) {
        Global.loadPage(value);
      }
    } finally {
      setTimeout(() => setLoading(false), 200);
    }
  }

  async function loginOauth(url: string) {
    const listener = Linking.addEventListener("url", handleRedirect);
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        url + "/" + Buffer.from(APP_URL).toString("base64")
      );

      if (
        (Platform.OS === "ios" || Platform.OS === "web") &&
        result.type === "success" &&
        result.url
      ) {
        await handleRedirect({ url: result.url });
      }
    } catch (error) {
      console.error(error);
      Global.ShowToast("Sign in could not be completed.");
    } finally {
      listener.remove();
    }
  }

  async function loginEmail() {
    if (!captchaId || !captchaText) return;

    setCaptchaVisible(false);
    const redirectUrl = APP_URL || (await Linking.getInitialURL());
    if (!redirectUrl) {
      Global.ShowToast(i18n.t("error.generic"));
      return;
    }

    const url =
      URL.AUTH_LOGIN +
      "?username=" +
      encodeURIComponent(email) +
      "&password=" +
      encodeURIComponent(password) +
      "&remember-me=" +
      "&redirect-url=" +
      Buffer.from(redirectUrl).toString("base64") +
      "&captchaId=" +
      captchaId +
      "&captchaText=" +
      encodeURIComponent(captchaText);

    try {
      const response = await Global.Fetch(url, "post", {}, "application/x-www-form-urlencoded");
      let redirectHeader = response.headers["redirect-url"];
      if (!redirectHeader) redirectHeader = response.data;

      if (
        response.request?.responseURL &&
        response.request?.responseURL !== URL.AUTH_LOGIN_ERROR &&
        redirectHeader
      ) {
        await handleRedirect({ url: redirectHeader });
      } else {
        Global.ShowToast(i18n.t("error.generic"));
      }
    } catch (error) {
      console.error(error);
      Global.ShowToast(i18n.t("error.generic"));
    }
  }

  async function requestCaptcha() {
    if (!emailValid || !password) return;

    Keyboard.dismiss();
    setCaptchaText("");
    try {
      const response = await Global.Fetch(URL.CATPCHA_GENERATE);
      const captcha: Captcha = response.data;
      setCaptchaId(captcha.id);
      setCaptchaImage(IMAGE_HEADER + captcha.image);
      setCaptchaVisible(true);
    } catch (error) {
      console.error(error);
      Global.ShowToast("Could not reach the configured server.");
    }
  }

  const style = StyleSheet.create({
    link: {
      color: colors.primary,
      marginBottom: 8,
    },
    oauthGoogle: {
      backgroundColor: "#4285f4",
    },
    oauthFacebook: {
      backgroundColor: "#4267b2",
    },
  });

  return (
    <VerticalView style={{ paddingTop: STATUS_BAR_HEIGHT, display: "flex" }}>
      {!loading && (
        <View>
          <View style={{ minHeight: height }}>
            <Image
              resizeMode="contain"
              style={{ height: 180, width: "100%", marginTop: 24 }}
              source={splash}
            />

            <Text
              variant="headlineLarge"
              style={{ textAlign: "center", marginTop: 12, fontWeight: "600" }}
            >
              {APP_NAME}
            </Text>
            <Text
              variant="bodySmall"
              style={{ textAlign: "center", marginBottom: 28, marginTop: 6, opacity: 0.6 }}
            >
              Server: {API_BASE_URL}
            </Text>

            {IS_ALOVOA_PRODUCTION && (
              <Text
                style={{
                  marginBottom: 16,
                  padding: 10,
                  borderRadius: 8,
                  backgroundColor: colors.errorContainer,
                  color: colors.onErrorContainer,
                }}
              >
                This build is connected to Alovoa production. Configure EXPO_PUBLIC_API_URL to
                your own backend before distributing it.
              </Text>
            )}

            <TextInput
              style={{ backgroundColor: colors.background }}
              label={i18n.t("email")}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setEmailValid(Global.isEmailValid(value));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={{ backgroundColor: colors.background }}
              label={i18n.t("password")}
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={requestCaptcha}
              autoCapitalize="none"
              secureTextEntry={true}
            />

            <Button
              icon="email"
              mode="contained"
              style={{ marginTop: 18 }}
              disabled={!emailValid || !password}
              onPress={requestCaptcha}
            >
              {i18n.t("auth.email")}
            </Button>

            <Divider style={{ marginVertical: height >= 800 ? 36 : 22 }} />

            <Button
              icon="google"
              mode="contained"
              style={style.oauthGoogle}
              onPress={() => loginOauth(URL.AUTH_GOOGLE)}
            >
              {i18n.t("auth.google")}
            </Button>
            <Button
              icon="facebook"
              mode="contained"
              style={[style.oauthFacebook, { marginTop: 8 }]}
              onPress={() => loginOauth(URL.AUTH_FACEBOOK)}
            >
              {i18n.t("auth.facebook")}
            </Button>

            <Divider style={{ marginVertical: height >= 800 ? 36 : 22 }} />

            <Button
              mode="outlined"
              onPress={() => Global.navigate("Register", false, { registerEmail: true })}
            >
              {i18n.t("register-email")}
            </Button>
          </View>

          <View style={{ marginTop: 40 }}>
            <Text style={style.link} onPress={() => Global.navigate("PasswordReset", false, {})}>
              {i18n.t("password-forget")}
            </Text>
            <Text style={style.link} onPress={() => WebBrowser.openBrowserAsync(URL.PRIVACY)}>
              {i18n.t("privacy-policy")}
            </Text>
            <Text style={style.link} onPress={() => WebBrowser.openBrowserAsync(URL.TOS)}>
              {i18n.t("tos")}
            </Text>
            <Text style={style.link} onPress={() => WebBrowser.openBrowserAsync(URL.IMPRINT)}>
              {i18n.t("imprint")}
            </Text>
          </View>
          <View style={{ paddingBottom: 38 }} />
        </View>
      )}

      <Modal
        isVisible={captchaVisible}
        onBackdropPress={() => setCaptchaVisible(false)}
        avoidKeyboard={false}
        style={{ justifyContent: "center", margin: 0 }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={containerStyle}>
            <IconButton
              style={{ alignSelf: "flex-end" }}
              icon="close"
              size={20}
              onPress={() => setCaptchaVisible(false)}
            />
            <Text>{i18n.t("captcha.title")}</Text>
            <Image resizeMode="contain" style={{ height: 100 }} source={{ uri: captchaImage }} />
            <TextInput
              mode="outlined"
              autoCorrect={false}
              label={i18n.t("captcha.placeholder")}
              value={captchaText}
              onChangeText={setCaptchaText}
              onSubmitEditing={loginEmail}
            />
            <View style={{ flexDirection: "row", marginTop: 8, justifyContent: "flex-end" }}>
              <IconButton icon="reload" size={20} onPress={requestCaptcha} />
              <IconButton icon="login-variant" size={20} onPress={loginEmail} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </VerticalView>
  );
};

export default Login;
