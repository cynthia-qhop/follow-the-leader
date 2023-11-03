import { StatusBar } from 'expo-status-bar'
import { View, ColorValue } from 'react-native'
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'
import Animated, {
  StyleProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import tw from 'twrnc'

const Colors: { [name: string]: ColorValue } = {
  black: '#000000',
  'black-900': '#4A4A4A',
  'black-800': '#E6E6E6',
}

type AnimatedPosition = {
  x: Animated.SharedValue<number>
  y: Animated.SharedValue<number>
}

const useFollowAnimatedPosition = ({ x, y }: AnimatedPosition) => {
  const followX = useDerivedValue(() => {
    return withSpring(x.value)
  })

  const followY = useDerivedValue(() => {
    return withSpring(y.value)
  })

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: followX.value }, { translateY: followY.value }],
    }
  })

  return { followX, followY, animatedStyle }
}

type BallProps = {
  animatedStyle: StyleProps
  color: ColorValue
}

const Ball = ({ animatedStyle, color }: BallProps) => {
  return (
    <Animated.View
      style={[
        { ...animatedStyle },
        tw.style(`absolute w-10 h-10 rounded-full bg-[${String(color)}]`),
      ]}
    />
  )
}

type AnimatedBallProps = {
  color: ColorValue
  position: { x: Animated.SharedValue<number>; y: Animated.SharedValue<number> }
}

const AnimatedBall = ({ color, position }: AnimatedBallProps) => {
  const { followX, followY, animatedStyle } = useFollowAnimatedPosition({
    x: position.x,
    y: position.y,
  })

  return (
    <Animated.View
      style={[
        { ...animatedStyle },
        tw.style(`absolute w-10 h-10 rounded-full bg-[${String(color)}]`),
      ]}
    />
  )
}

export default function App() {
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)

  // The context of a gesture used to be provided in each callback, but now it is handled manually using SharedValues.
  const context = useSharedValue({ x: 0, y: 0 })

  // useAnimatedGestureHandler from react-native-reanimated was replaced with Gesture.
  const pan = Gesture.Pan()
    .onStart(() => {
      // Replaces onBegin callback.
      context.value = { x: translateX.value, y: translateY.value }
    })
    .onUpdate((event) => {
      // Replaces onActive callback.
      translateX.value = event.translationX + context.value.x
      translateY.value = event.translationY + context.value.y
    })

  const {
    followX: primaryBallFollowX,
    followY: primaryBallFollowY,
    animatedStyle: primaryBallAnimatedStyle,
  } = useFollowAnimatedPosition({
    x: translateX,
    y: translateY,
  })

  const {
    followX: secondaryBallFollowX,
    followY: secondaryBallFollowY,
    animatedStyle: secondaryBallAnimatedStyle,
  } = useFollowAnimatedPosition({
    x: primaryBallFollowX,
    y: primaryBallFollowY,
  })

  const {
    // followX: tertiaryBallFollowX,
    // followY: tertiaryBallFollowY,
    animatedStyle: tertiaryBallAnimatedStyle,
  } = useFollowAnimatedPosition({
    x: secondaryBallFollowX,
    y: secondaryBallFollowY,
  })

  return (
    <GestureHandlerRootView style={[{}, tw.style(`flex flex-1`)]}>
      <View style={[{}, tw.style(`flex flex-1 items-center justify-center`)]}>
        {/* TODO: Refactor to create multiple balls. */}
        {/* {Object.values(Colors)
          .map((color) => {
            return {
              color,
              position: { x: primaryBallFollowX, y: primaryBallFollowY },
            }
          })
          .map((ball) => {
            return <AnimatedBall color={ball.color} position={ball.position} />
          })} */}

        <Ball
          color={Colors['black-800']}
          animatedStyle={tertiaryBallAnimatedStyle}
        />

        <Ball
          color={Colors['black-900']}
          animatedStyle={secondaryBallAnimatedStyle}
        />

        {/* Previously used a specific gesture handler, such as PanGestureHandler. */}
        <GestureDetector gesture={pan}>
          <Ball color={Colors.black} animatedStyle={primaryBallAnimatedStyle} />
        </GestureDetector>

        <StatusBar style='auto' />
      </View>
    </GestureHandlerRootView>
  )
}
