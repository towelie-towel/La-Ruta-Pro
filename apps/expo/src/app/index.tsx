import {
    Image,
    Dimensions,
    ActivityIndicator,
    Pressable,
    Animated,
    Keyboard,
} from "react-native";
import {
    DrawerContentScrollView,
    DrawerItem,
    createDrawerNavigator
} from '@react-navigation/drawer';
import { AntDesign, FontAwesome, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import NetInfo from '@react-native-community/netinfo';

import { View, Text } from '~/components/shared/Themed';
import { PressBtn } from '~/components/shared/PressBtn';
import Colors from '~/constants/Colors';

import SignIn from "~/components/screens/Sign-in";
import SignUp from "~/components/screens/Sign-up";
import MapViewScreen from '~/components/screens/MapView';
import HistoryScreen from '~/components/screens/History';
import ConfigScreen from '~/components/screens/Config';
import CustomServiceScreen from '~/components/screens/CustomService';
import DeviceScreen from "~/components/screens/Device";
import PaymentScreen from '~/components/screens/Payment';
import NetworkScreen from "~/components/screens/Network";
import AdminScreen from "~/components/screens/Admin";

import usePressIn from '~/hooks/animations/usePressIn';

const isAdmin = true;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type DrawerParamList = {
    "Sign-In": undefined;
    "Sign-Up": undefined;
    "Map": undefined;
    "History": undefined;
    "Config": undefined;
    "Network": undefined;
    "Admin": undefined;
    "Device": undefined;
    "Service": undefined;
    "Payment": undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();


export default function Home() {

    const { width } = Dimensions.get("window");
    const isLargeScreen = width >= 768;
    const isSmallScreen = width <= 400;
    const drawerWidth = isLargeScreen
        ? (width / 4)
        : isSmallScreen ? 200 : (width / 2)

    const { isConnected, isInternetReachable, type: connectionType } = NetInfo.useNetInfo()

    const { colorScheme } = useColorScheme();

    const { animatedValue: pressMenuAnim, handlePressIn: pressInMenu, handlePressOut: pressOutMenu, isPressed: isMenuPressed } = usePressIn()

    return (
        <Drawer.Navigator
            initialRouteName="Map"
            screenOptions={{

                drawerStyle: [{
                    width: drawerWidth,
                    borderRightColor: colorScheme === 'dark' ? '#333333' : '#888888',
                    borderRightWidth: 1,
                }],
                drawerType: /* isLargeScreen ? 'permanent' :  */'back',
                overlayColor: 'transparent',
                header({ navigation }) {
                    return (
                        <Animated.View
                            className={'absolute top-9 left-10 max-[367px]:left-6'}
                            style={[
                                {
                                    transform: [
                                        {
                                            scale: pressMenuAnim
                                        }
                                    ]
                                },
                            ]}
                        >
                            <Pressable
                                onPressIn={() => {
                                    pressInMenu();
                                }}
                                onPressOut={() => {
                                    pressOutMenu();
                                }}
                                onPress={() => {
                                    navigation.openDrawer();
                                    Keyboard.dismiss()
                                }}
                                className={'p-3 rounded-full bg-transparent'}
                            >
                                <AntDesign
                                    name={'menuunfold'}
                                    size={30}
                                    color={Colors[colorScheme ?? 'light'].text}
                                />
                            </Pressable>
                        </Animated.View>
                    )
                },

            }}
            drawerContent={(props) => {
                const { navigation } = props;
                return (
                    <DrawerContentScrollView
                        contentContainerStyle={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            backgroundColor: colorScheme === 'dark' ? 'black' : 'white',
                        }} {...props}
                    >

                        <DrawerItem style={{
                            width: '100%',
                            marginHorizontal: 0,
                            marginVertical: 0,
                            borderRadius: 0
                        }} labelStyle={{
                            width: '100%',
                        }} pressColor={colorScheme === 'dark' ? 'white' : 'black'} icon={() => {

                            if (false) {
                                return (
                                    <View className={'w-full flex-row justify-start items-center bg-transparent px-5 max-[376px]:px-3 max-[376px]:my-0'}>
                                        <ActivityIndicator
                                            size={'large'}
                                            animating
                                            color={colorScheme === 'dark' ? 'white' : 'black'}
                                        />
                                    </View>
                                )
                            }

                            if (!false) {
                                return (
                                    <View className={'w-full flex-row justify-start items-center bg-transparent px-5 max-[376px]:px-3 max-[376px]:my-0'}>
                                        <FontAwesome
                                            name={colorScheme === 'light' ? 'user-circle' : 'user-circle-o'}
                                            size={30}
                                            color={Colors[colorScheme ?? 'light'].text}
                                        />
                                        <PressBtn onPress={() => {
                                            navigation.navigate("Sign-Up")
                                        }} className={`w-[60px] max-w-[120px] ml-5 bg-slate-500 dark:bg-slate-700 rounded h-8 justify-center items-center`} >
                                            <Text className={`text-white`}>Sign Up</Text>
                                        </PressBtn>
                                    </View>
                                )
                            }

                            return (
                                <View className={`w-full justify-between flex-row items-center bg-transparent px-5 max-[376px]:px-3 max-[376px]:my-0`}>

                                    <View className="w-full bg-transparent flex-row items-center">
                                        <Image
                                            source={{
                                                uri: "https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c"
                                            }}
                                            alt="Profile Image"
                                            className={`w-8 h-8 rounded-full`}
                                        />
                                        <Text className="ml-5">{"username"}</Text>
                                    </View>
                                    <View className="absolute items-center justify-center bg-transparent top-0 right-1 flex-row gap-2">
                                        <View style={{
                                            backgroundColor: isConnected && isInternetReachable ? 'rgb(74 222 128)' : 'rgb(248 113 113)'
                                        }} className="w-2 h-2 rounded-full"></View>
                                        {
                                            connectionType.includes('wifi')
                                                ? (
                                                    <MaterialIcons
                                                        name='wifi'
                                                        size={10}
                                                        color={Colors[colorScheme ?? 'light'].text}
                                                    />
                                                )
                                                : (
                                                    <MaterialIcons
                                                        name='network-cell'
                                                        size={10}
                                                        color={Colors[colorScheme ?? 'light'].text}
                                                    />
                                                )
                                        }
                                    </View>

                                </View>

                            )

                        }} label={'Sign-In'} onPress={() => { }} />

                        <DrawerItem style={{
                            width: '100%',
                            marginHorizontal: 0,
                            marginVertical: 0,
                            borderRadius: 0
                        }} pressColor={colorScheme === 'dark' ? 'white' : 'black'} icon={() => {
                            return (
                                <View className={`w-full my-2 flex-row justify-start items-center bg-transparent px-5 max-[376px]:px-3 max-[376px]:my-0`}>
                                    <Ionicons
                                        name={colorScheme === 'light' ? 'md-map-outline' : 'md-map'}
                                        size={30}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                    <Text className="ml-5">Mapa</Text>
                                </View>
                            )
                        }} label={'Mapa'} onPress={() => { navigation.navigate('Map') }} />

                        <DrawerItem style={{
                            width: '100%',
                            marginHorizontal: 0,
                            marginVertical: 0,
                            borderRadius: 0,
                        }} pressColor={colorScheme === 'dark' ? 'white' : 'black'} icon={() => {
                            return (
                                <View className={`w-full my-2 flex-row justify-start items-center bg-transparent px-5 max-[376px]:px-3 max-[376px]:my-0`}>
                                    <MaterialIcons
                                        name='history'
                                        size={30}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                    <Text className="ml-5">History</Text>
                                </View>
                            )
                        }} label={'History'} onPress={() => { navigation.navigate('History') }} />

                        <DrawerItem style={{
                            width: '100%',
                            marginHorizontal: 0,
                            marginVertical: 0,
                            borderRadius: 0
                        }} pressColor={colorScheme === 'dark' ? 'white' : 'black'} icon={() => {
                            return (
                                <View className={`w-full my-2 flex-row justify-start items-center bg-transparent px-5 max-[376px]:px-3 max-[376px]:my-0`}>
                                    <FontAwesome
                                        name='gear'
                                        size={30}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                    <Text className="ml-6">Config</Text>
                                </View>
                            )
                        }} label={'Config'} onPress={() => { navigation.navigate('Config') }} />

                        <DrawerItem style={{
                            width: '100%',
                            marginHorizontal: 0,
                            marginVertical: 0,
                            borderRadius: 0
                        }} pressColor={colorScheme === 'dark' ? 'white' : 'black'} icon={() => {
                            return (
                                <View className={`w-full my-2 flex-row justify-start items-center bg-transparent px-5 max-[376px]:px-3 max-[376px]:my-0`}>
                                    <AntDesign
                                        name='customerservice'
                                        size={30}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                    <Text className="ml-5">Service</Text>
                                </View>
                            )
                        }} label={'Service'} onPress={() => { navigation.navigate('Service') }} />

                        <DrawerItem style={{
                            width: '100%',
                            marginHorizontal: 0,
                            marginVertical: 0,
                            borderRadius: 0
                        }} pressColor={colorScheme === 'dark' ? 'white' : 'black'} icon={() => {
                            return (
                                <View className={`w-full my-2 flex-row justify-start items-center bg-transparent px-5 max-[376px]:px-3 max-[376px]:my-0`}>
                                    <FontAwesome5
                                        name='money-check'
                                        size={24}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                    <Text className="ml-5">Payment</Text>
                                </View>
                            )
                        }} label={'Payment'} onPress={() => { navigation.navigate('Payment') }} />

                        {
                            isAdmin &&
                            <>
                                <DrawerItem style={{
                                    width: '100%',
                                    marginHorizontal: 0,
                                    marginVertical: 0,
                                    borderRadius: 0
                                }} pressColor={colorScheme === 'dark' ? 'white' : 'black'} icon={() => {
                                    return (
                                        <View className={`w-full my-2 flex-row justify-start items-center bg-transparent px-5 max-[376px]:px-3 max-[376px]:my-0`}>
                                            <MaterialIcons
                                                name='admin-panel-settings'
                                                size={30}
                                                color={Colors[colorScheme ?? 'light'].text}
                                            />
                                            <Text className="ml-5">Admin Info</Text>
                                        </View>
                                    )
                                }} label={'Admin'} onPress={() => { navigation.navigate('Admin') }} />

                                <DrawerItem style={{
                                    width: '100%',
                                    marginHorizontal: 0,
                                    marginVertical: 0,
                                    borderRadius: 0
                                }} pressColor={colorScheme === 'dark' ? 'white' : 'black'} icon={() => {
                                    return (
                                        <View className={`w-full my-2 flex-row justify-start items-center bg-transparent px-5 max-[376px]:px-3 max-[376px]:my-0`}>
                                            <MaterialIcons
                                                name='perm-device-information'
                                                size={30}
                                                color={Colors[colorScheme ?? 'light'].text}
                                            />
                                            <Text className="ml-5">Device Info</Text>
                                        </View>
                                    )
                                }} label={'Device'} onPress={() => { navigation.navigate('Device') }} />

                                <DrawerItem style={{
                                    width: '100%',
                                    marginHorizontal: 0,
                                    marginVertical: 0,
                                    borderRadius: 0
                                }} pressColor={colorScheme === 'dark' ? 'white' : 'black'} icon={() => {
                                    return (
                                        <View className={`w-full my-2 flex-row justify-start items-center bg-transparent px-5 max-[376px]:px-3 max-[376px]:my-0`}>
                                            <MaterialIcons
                                                name='network-cell'
                                                size={30}
                                                color={Colors[colorScheme ?? 'light'].text}
                                            />
                                            <Text className="ml-5">Network</Text>
                                        </View>
                                    )
                                }} label={'Network'} onPress={() => { navigation.navigate('Network') }} />

                            </>
                        }


                        <DrawerItem style={{
                            width: '100%',
                            marginHorizontal: 0,
                            marginVertical: 0,
                            position: 'absolute',
                            bottom: 0,
                            borderRadius: 0
                        }} pressColor={colorScheme === 'dark' ? 'white' : 'black'} icon={() => (
                            <View className="w-full flex-row justify-around items-center bg-transparent">
                                <PressBtn>
                                    <AntDesign
                                        name='instagram'
                                        size={25}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                </PressBtn>
                                <PressBtn>
                                    <AntDesign
                                        name='facebook-square'
                                        size={25}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                </PressBtn>
                                <PressBtn>
                                    <AntDesign
                                        name='twitter'
                                        size={25}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                </PressBtn>
                            </View>
                        )} label={'Social Networks'} onPress={() => { console.log("nothing") }} />

                    </DrawerContentScrollView>
                )
            }}
        >

            <Drawer.Screen name="Sign-In" component={SignIn} />
            <Drawer.Screen name="Sign-Up" component={SignUp} />
            <Drawer.Screen name="Map" component={MapViewScreen} />
            <Drawer.Screen name="History" component={HistoryScreen} />
            <Drawer.Screen name="Config" component={ConfigScreen} />
            <Drawer.Screen name="Network" component={NetworkScreen} />
            <Drawer.Screen name="Admin" component={AdminScreen} />
            <Drawer.Screen name="Device" component={DeviceScreen} />
            <Drawer.Screen name="Service" component={CustomServiceScreen} />
            <Drawer.Screen name="Payment" component={PaymentScreen} />

        </Drawer.Navigator>
    );
}
