import { View, Text, Image, Alert } from "react-native";
import React, { useCallback } from "react";
import CustomButtom from "./CustomButtom";
import { icons } from "@/constants";
import { useOAuth } from "@clerk/clerk-expo";
import { googleOAuth } from "@/lib/auth";
import { router } from "expo-router";

const Oauth = () => {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const handleGoogleSignIn = useCallback(async () => {
    try {
      const result = await googleOAuth(startOAuthFlow);
      if (result.code === "session_exists" || result.code === "success") {
        router.push("/(root)/(tabs)/home");
      }
    } catch (error) {
      console.error("OAuth error", error);
    }
  }, []);
  return (
    <View>
      <View className=" flex-row justify-center items-center mt-4 gap-x-3">
        <View className="flex-1 h-[1px] bg-general-100" />
        <Text className=" text-lg ">Or</Text>
        <View className="flex-1 h-[1px] bg-general-100" />
      </View>
      <CustomButtom
        title="Log in with Google"
        className=" mt-5 w-full shadow-none"
        IconLeft={() => (
          <Image
            source={icons.google}
            className="w-5 h-5 mx-2"
            resizeMode="contain"
          />
        )}
        bgVariant="outline"
        textVariant="primary"
        onPress={handleGoogleSignIn}
      />
    </View>
  );
};

export default Oauth;
