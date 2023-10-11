import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Container from "Components/Container";
import CustomRow from "Components/CustomRow";
import CustomText from "Components/CustomText";
import { Colors } from "Constants";
import ImageIcon from "agora-rn-uikit/src/Controls/ImageIcon";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import createAgoraRtcEngine, { ChannelProfileType, ClientRoleType, IRtcEngine } from 'react-native-agora';

export default function VoiceCall(){
    let {
        params
    } = useRoute();
    const Navigation = useNavigation();

    console.log('paramsss_',params)
    const APP_ID = "0582822818984f60a755edb75c6f738a";
    const token = "007eJxTYNjecUjQ+YR+V7+H0Bu5ereMRUIn5fcz9VcfD5L1fvD1Y7UCg4GphZGFkZGFoYWlhUmamUGiualpakqSuWmyWZq5sUVi6Fq21IZARga3KDsWRgYIBPHZGTIy0zPKEysZGAAsBh5n";
    // decodeURIComponent(params.token);
    const channel = 'highway';


    // const channel = "voice_channel";
    const uid = 12345;
    // const token = "007eJxTYLgiffSz0tzDV1Vufu/xsV/qKffK8mrxqwdVSUnXL7pXJ5UqMBiYWhhZGBlZGFpYWpikmRkkmpuapqYkmZsmm6WZG1skHvU/ltIQyMjQtTCbhZEBAkF8Xoay/Mzk1PjkjMS8vNQcBgYALoYk/Q==";
    const agoraEngineRef = useRef(); // Agora engine instance
    const [isJoined, setIsJoined] = useState(false); // Indicates if the local user has joined the channel
    const [remoteUid, setRemoteUid] = useState(0); // Uid of the remote user
    const [message, setMessage] = useState(''); // Message to the user
    const [isMute, setMute] = useState(false);
    useEffect(() => {
        // Initialize Agora engine when the app starts
        setupVoiceSDKEngine();
     },[]);
     
    const setupVoiceSDKEngine = async () => {
        try {
        // use the helper function to get permissions
        // if (Platform.OS === 'android') { await getPermission()};

        agoraEngineRef.current = createAgoraRtcEngine();
        const agoraEngine = agoraEngineRef.current;
        // agoraEngine.enableLocalAudio(true);
        agoraEngine.registerEventHandler({
            onJoinChannelSuccess: () => {
                console.log('me joined');
                // showMessage('Successfully joined the channel ' + channelName);
                setIsJoined(true);
            },
            onUserJoined: (_connection, Uid) => {
                console.log('some user_joined',Uid);
                // showMessage('Remote user joined with uid ' + Uid);
                setRemoteUid(Uid);
            },
            onUserOffline: (_connection, Uid) => {
                agoraEngine.leaveChannel();
                Navigation.goBack();
                console.log('some user left');
                // showMessage('Remote user left the channel. uid: ' + Uid);
                setRemoteUid(0);
            },
            
        });
        agoraEngine.initialize({
            appId: "0582822818984f60a755edb75c6f738a"
        });
        join();
        } catch (e) {
            console.log(e);
        }
    };

    const join = async () => {
        if (isJoined) {
            return;
        }
        try {
            agoraEngineRef.current?.setChannelProfile(
                ChannelProfileType.ChannelProfileCommunication,
            );
            agoraEngineRef.current?.joinChannel(token, channel, uid, {
                clientRoleType: ClientRoleType.ClientRoleBroadcaster,
            });
        } catch (e) {
            console.log(e);
        }
    };
    const leave = () => {
        try {
            agoraEngineRef.current?.leaveChannel();
            setRemoteUid(0);
            setIsJoined(false);
            Navigation.goBack();
        } catch (e) {
            console.log(e);
        }
    };

    const handleMute=()=>{
        try {
            agoraEngineRef.current?.muteLocalAudioStream(!isMute);
            setMute(!isMute);
            // setRemoteUid(0);
            // setIsJoined(false);
            // showMessage('You left the channel');
        } catch (e) {
            console.log(e);
        }
    }
    console.log('mute',isMute);
    return(
        <Container>
            {/* <View style={{padding : 30}}>
                <Text onPress={join} style={{color : 'black'}}>
                    Join Call
                </Text>
                {
                    isJoined
                    ?
                    <View>
                        <Text onPress={handleMute} style={{color : 'black'}}>
                            {isMute ? 'Unmute' : 'Mute'}
                        </Text>
                        <Text onPress={leave} style={{color : 'black'}}>
                            Cut Call
                        </Text>
                    </View>
                    :
                    null
                }
            </View> */}
            <View style={{flex:1, backgroundColor : Colors.Primary}}>
                <View style={{flex:0.8, alignItems : 'center', justifyContent : 'center'}}>
                    <View style={{height : 200, width : 200, backgroundColor : 'rgba(100,100,100,0.5)', borderRadius : 300, justifyContent : 'center', alignItems : 'center'}}>
                        <CustomText
                        value="S"
                        size={100}
                        semiBold
                        color="white"
                        />
                    </View>
                </View>
                <View style={{flex:0.2}}>
                    <CustomRow ratios={[1,1]} itemStyle={{alignItems : 'center'}}>
                    <TouchableOpacity onPress={handleMute} style={styles.btnContainer}>
                    <ImageIcon
                    name={isMute ? "micOff" : "mic"}
                    style={styles.iconStyle}
                    />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={leave} style={[styles.btnContainer,{backgroundColor : 'red'}]}>
                    <ImageIcon
                    name="callEnd"
                    style={[styles.iconStyle]}
                    />
                    </TouchableOpacity>
                    
                    <ImageIcon
                    name="micOff"
                    style={{backgroundColor : 'red'}}
                    />
                    </CustomRow>
                </View>
            </View>
        </Container>
    )
}

const styles = StyleSheet.create({
    btnContainer : {
        height : 60, 
        width : 60, 
        backgroundColor : 'green', 
        borderRadius : 100, 
        alignItems : 'center', 
        justifyContent : 'center'
    },
    iconStyle : {
        padding : 10, 
        height : 30, 
        width : 30
    }
})