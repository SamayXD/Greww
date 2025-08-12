import { StyleSheet, View, Keyboard, KeyboardAvoidingView } from "react-native";
import React, { useState, useEffect } from "react";
import Modal from "react-native-modal";
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { hp } from "../utils/responsive";

const BottomModal = ({
  visible,
  setModalVisible,
  children,
  height,
  backdropDisable,
  keyBoardAvoidingHeight,
  disableSwipe,
}: {
  visible: boolean;
  setModalVisible: (value: boolean) => void;
  children: React.ReactNode;
  height?: number;
  backdropDisable?: boolean;
  keyBoardAvoidingHeight?: number;
  disableSwipe?: boolean;
}) => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const animatedHeight = useSharedValue(height ? height : hp(60));

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: animatedHeight.value,
    };
  });

  const updateHeight = (keyboardOpen: boolean) => {
    const targetHeight = keyboardOpen
      ? keyBoardAvoidingHeight
        ? keyBoardAvoidingHeight
        : hp(55)
      : height
      ? height
      : hp(60);
    animatedHeight.value = withTiming(targetHeight, {
      duration: 400,
    });
  };

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      "keyboardWillShow",
      () => {
        runOnJS(updateHeight)(true);
        setIsKeyboardOpen(true);
      }
    );
    const keyboardWillHideListener = Keyboard.addListener(
      "keyboardWillHide",
      () => {
        runOnJS(updateHeight)(false);
        setIsKeyboardOpen(false);
      }
    );

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, [height]);

  return (
    <View style={{}}>
      <Modal
        isVisible={visible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriverForBackdrop={true}
        swipeDirection={disableSwipe ? [] : "down"}
        swipeThreshold={200}
        propagateSwipe={true}
        onSwipeComplete={() => {
          setModalVisible(false);
        }}
        onBackdropPress={() => {
          if (!backdropDisable) {
            setModalVisible(true);
          }
        }}
        style={{
          justifyContent: "flex-end",
          margin: 0,
        }}
        onDismiss={() => {
          if (backdropDisable) {
            setModalVisible(true);
          }
        }}
      >
        <KeyboardAvoidingView behavior="padding" enabled={isKeyboardOpen}>
          <Animated.View
            style={[
              {
                backgroundColor: "#F9FAFB",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingTop: 20,
              },
              animatedStyle,
            ]}
            entering={FadeIn}
            // layout={Platform.OS === "ios" ? LinearTransition : FadingTransition}
          >
            {children}
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default BottomModal;

const styles = StyleSheet.create({});
