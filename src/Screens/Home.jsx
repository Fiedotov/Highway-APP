import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Button, ImageBackground, Modal, PermissionsAndroid, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Assets from '../Assets';
import IonIcons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import createAgoraRtcEngine, {ChannelProfileType, ClientRoleType} from 'react-native-agora';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
const uniqueId = ()=>{
    const timestamp = Date.now();
    const randomValue = Math.floor(Math.random() * 10000);
    return `${randomValue}${timestamp}`;
  }
export default function Home(props){
    const changeStarted = useRef(null);
    const [totalUsers, setTotalUsers]=useState(0);
    const [users, setUsers] = useState([]);
    const data = [Assets.m6northsouth, Assets.m6northsouth, Assets.m1northsouth, Assets.m1northsouth];
    const dt = ["M6 Southbound", "M6 Northbound", "M1 Northbound", "M1 Southbound"];
    // let channels = ["m6south_channel","m6north_channel","m1north_channel","m1south_channel"];
    // let tokens = [
    //     '007eJxTYKhbeS/RabH6F5Zd77ev4qv0y5ge/EIhqDNB6BLbJgnZJFMFBmODFHMzSwtj07SkZJNUI0vLlEQzS2MzkySTJDMzI8uUfRLCqQ2BjAxz2xcxMAIhCxCDABOYZAaTLGCSnyHXrDi/tCQjPjkjMS8vNYeBAQAXvyET',
    //     '007eJxTYLh1r/rDdhW7Iof2hVn6Ezq+cq1tvFBs5y8apOnff+/E9xMKDMYGKeZmlhbGpmlJySapRpaWKYlmlsZmJkkmSWZmRpYp+ySEUxsCGRlqY78zMzIwMrAAMQgwgUlmMMkCJvkZcs3y8otKMuKTMxLz8lJzGBgAAaEjag==',
    //     '007eJxTYPh3a6py07JXZQF/dQT2yjyf3zOF99y1f4eiLe/XyD9yawxUYDA2SDE3s7QwNk1LSjZJNbK0TEk0szQ2M0kySTIzM7JM2SchnNoQyMgg9jKehZGBkYEFiEGACUwyg0kWMMnPkGuYl19UkhGfnJGYl5eaw8AAAGYXI/U=',
    //     '007eJxTYIhdeWrFxrOnrki/7Vh3nadvyVETni9+Ty+5zWM5IrXBVcFQgcHYIMXczNLC2DQtKdkk1cjSMiXRzNLYzCTJJMnMzMgyZZ+EcGpDICPDpVcSDIxAyALEIMAEJpnBJAuY5GfINSzOLy3JiE/OSMzLS81hYAAASYEjxw=='
    // ];
    const [channels, setChannels] = useState([]);
    const [tokens, setTokens] = useState([]);
    const [highways, setHighways] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [uid, setUId] = useState(uniqueId());
    const [uidModalVisible, setUIdModalVisible] = useState(false);
    const [isMute, setIsMute] = useState(true);
    const [remoteAudioEnabled, setRemotedAudioEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const RemoteUserActive = useRef(false);

    const Navigation = useNavigation();

    const texts = [
        "Keep Chitchat to minimum",
        "Say position when reporting a hazard(2 miles after junction 42, oil on line 1)",
        "No abuse of other users",
        "anything illegal should not be discussed"
    ];

    const APP_ID = "30d769835fbc4e299da69364b4b6629d";//enter agora APPID

    const fetchTokens=async()=>{
        try{
            const response = await fetch('http://95.164.44.248:3122/tokens',{method : 'GET'});
            let dt = await response.json();
            console.log('dt',dt);
            let tokens = dt.map((item)=> item.token);
            let channels = dt.map((item)=> item.channel);
            setTokens(tokens);
            setChannels(channels);
            setIsLoading(false);
            // join();
        }
        catch(e){

        }
    }

    // useEffect(()=>{
    //     fetchTokens();
    // },[]);

    useEffect(()=>{
        if(channels.length){
            join();
        }
    },[channels.length]);

    const agoraEngineRef = useRef(); // Agora engine instance
    const [isJoined, setIsJoined] = useState(false); // Indicates if the local user has joined the channel
    const [remoteUid, setRemoteUid] = useState(0); // Uid of the remote user
    const [message, setMessage] = useState(''); // Message to the user
    // const [isMute, setMute] = useState(false);
    const [userLeft, setUserLeft] = useState(null);
    useEffect(() => {
        // Initialize Agora engine when the app starts
        // setupVoiceSDKEngine();
        getPermission();
     },[]);
    const getPermission = async () => {
        if (Platform.OS === 'android') {
            await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
            ]).then(()=>{
                setupVoiceSDKEngine();
            });
        }
        else{
            setupVoiceSDKEngine();
        }
    };

    // useEffect(()=>{
    //     console.log('user_left',userLeft);
    //     console.log('uid',uid);
    //     if(userLeft){
    //         if(userLeft==uid){
    //             console.log('self_left_highway');
    //             join();
    //         }
    //         else{
    //             console.log('some_other_user_left_highway');
    //             setUsers((v)=>v.filter((item)=> item!=userLeft))
    //         }
    //     }
    // },[userLeft]);

    const handleUserLeft=(userId)=>{
        if(userId){
            if(userLeft==uid){
                console.log('self_left_highway');
                join();
            }
            else{
                console.log('some_other_user_left_highway');
                setUsers((v)=>v.filter((item)=> item!=userId))
            }
        }
    }

    console.log('usersssss',users);
     
    const setupVoiceSDKEngine = async () => {
        try {
        // use the helper function to get permissions
        // if (Platform.OS === 'android') { await getPermission()};

        agoraEngineRef.current = createAgoraRtcEngine();
        const agoraEngine = agoraEngineRef.current;
        agoraEngine.registerEventHandler({
            onJoinChannelSuccess: () => {
                console.log('me joined');
                // showMessage('Successfully joined the channel ' + channelName);
                setIsJoined(true);
            },
            onUserJoined: (_connection, Uid) => {
                console.log('some user_joined',Uid);
                // set((v)=>v+1);
                if(users.find((item)=> item==Uid)){
                    setUsers((v)=> v.filter((item)=> item!=Uid));
                }
                else{
                    setUsers((v)=> [...v,Uid])
                }
                
                // showMessage('Remote user joined with uid ' + Uid);
                // setRemoteUid(Uid);
            },
            onUserOffline: (_connection, Uid) => {
                // agoraEngine.leaveChannel();
                // Navigation.goBack();
                console.log('some user left',Uid);
                setUserLeft(Uid);
                handleUserLeft(Uid);

                // showMessage('Remote user left the channel. uid: ' + Uid);
                // setRemoteUid(0);
            },
            onUserMuteAudio : (conn, UID)=>{
                console.log('UID_______',UID);
            },
            onLeaveChannel : ()=>{
                console.log('channel_leaved');
                // setUserLeft(uid);
                handleUserLeft(uid);
            },
            onRemoteAudioStateChanged:(connection,
                remoteUid,
                state,
                reason)=>{
                    if(state==0){
                        RemoteUserActive.current = false;
                    }
                    else{
                        RemoteUserActive.current = true;
                    }
                    console.log('remote_audio_state_changes');
                    console.log('user_id',remoteUid);
                    console.log('styate____',state)
                }
        });
        agoraEngine.initialize({
            appId: APP_ID
        });
        fetchTokens();
        // join();
        } catch (e) {
            console.log(e);
        }
    };

    const join = async () => {
        console.log('joining_initiate', dt[highways]);
        console.log('token_to_join_with',tokens[highways]);
        console.log('channel_to_join_with',channels[highways]);
        console.log('uid_to_joining_with',uid);
        setIsMute(true);
        setRemotedAudioEnabled(false);
        agoraEngineRef.current.muteLocalAudioStream(true);
        try {
            agoraEngineRef.current?.setChannelProfile(
                ChannelProfileType.ChannelProfileLiveBroadcasting,
            );
            agoraEngineRef.current?.joinChannel(tokens[highways], channels[highways], parseInt(uid), {
                clientRoleType: ClientRoleType.ClientRoleBroadcaster,
                autoSubscribeAudio : false
            });
        } catch (e) {
            console.log(e);
        }
    };

    const leave = () => {
        try {
            agoraEngineRef.current?.leaveChannel();
            console.log('eft_previous_channel');
            join();
            // setRemoteUid(0);
            // setIsJoined(false);
            // Navigation.goBack();
        } catch (e) {
            console.log(e);
        }
    };
    const handleLeaveAndJoin=async()=>{
        // agoraEngineRef.current.enableLocalAudio(true);
    }

    useEffect(()=>{
        setUsers([]);
        if(changeStarted.current){
            leave();
        }
        else{
            changeStarted.current = true;
        }
    },[highways]);

    const handleRemoteAudio=()=>{
        if(!remoteAudioEnabled){
            setModalVisible(true);
        }
        agoraEngineRef.current.muteAllRemoteAudioStreams(remoteAudioEnabled);
        setRemotedAudioEnabled((v)=> !v);
    }

    const handleLocalMic=(value)=>{
        console.log('mute_va',value)
        agoraEngineRef.current.muteLocalAudioStream(value);
        setIsMute(value);
        // if()
    }

    // const tapGesture = useMemo(
    //     () =>
    //       Gesture.LongPress()
    //       .onStart(() => {
    //         console.log('press started');
    //         runOnJS(setIsMute)(false);
    //       }).onEnd(()=>{
    //         console.log('on_end');
    //         runOnJS(setIsMute)(true);
    //     }),
    //     [isMute, setIsMute]
    //   );

    const tapGesture = Gesture.LongPress().enabled(true).onEnd(()=>{
            console.log('ending')
            // runOnJS(setIsMute)(true);
          }).onBegin(()=>{
            // runOnJS(setIsMute)(false);
            console.log('beginning')
    });
    if(isLoading){
        return(
            <View style={{flex:1, justifyContent : 'center', alignItems : 'center'}}>
                <ActivityIndicator size={40} color={"black"} />
            </View>
        )
    }
    return(
        <View style={Styles.container}>
            <ImageBackground style={{flex:1}} source={data[highways]}>
                <View style={Styles.subContainer}>
                    <View style={Styles.subContainerChild1}>
                        <IonIcons
                        name="menu" 
                        size={40} 
                        color="black" 
                        onPress={()=>{Navigation?.openDrawer?.()}} 
                        />
                        <View style={{alignItems : 'center', backgroundColor : 'rgba(255,255,255,0.2)', borderRadius : 10, padding : 10}}>
                            <View style={{alignItems : 'center', backgroundColor : 'rgba(255,255,255,0.2)', padding : 10, borderRadius : 10, width : 80+'%' }}>
                            <Text style={{fontSize : 20,fontWeight : 'bold', color : 'black'}}>
                                {dt[highways]}
                            </Text>
                            {/* <Text>{uid}</Text> */}
                            </View>
                            <View style={{flexDirection : 'row', width : 90+'%', margin : 10}}>
                                <View style={{flexDirection : 'row', alignItems : 'center', flex:1, alignSelf : 'flex-start', marginTop : 10}}>
                                    <IonIcons name={"person"} size={18} color="black" />
                                    <Text style={{color : 'black', fontWeight : 'bold', fontSize : 16, marginLeft : 2}}>{users.length + 1}</Text>
                                </View>

                                <View style={{flex:1, alignItems : 'center'}}>
                                    <IonIcons name={'arrow-up'} color="white" size={50} onPress={()=> setHighways((v)=>v==0 ? data.length-1 : v-1)} />
                                    <IonIcons name={'arrow-down'} color="white" size={50} onPress={()=> setHighways((v)=>v==data.length-1 ? 0 : v+1)} />
                                </View>
                                <View style={{flex:1, alignItems : 'flex-end', alignSelf : 'center'}}>
                                    <IonIcons 
                                    name="power" 
                                    size={40} 
                                    color={remoteAudioEnabled ? "green" : "red"} 
                                    onPress={()=>{
                                        // setModalVisible(true)
                                        handleRemoteAudio();
                                    }} 
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={Styles.subContainerChild2} >
                        <View
                        onTouchStart={()=>{
                            if(remoteAudioEnabled && !RemoteUserActive.current){
                                handleLocalMic(false);
                            }
                        }} 
                        onTouchEnd={()=>{
                            if(remoteAudioEnabled && !RemoteUserActive.current){
                                handleLocalMic(true);
                            }
                        }}
                        >
                        <IonIcons 
                        name="mic"
                        size={!isMute ? 100 : 80} color={!isMute ? "white" : "black"} />
                        </View>
                        <Text style={Styles.pushText}>
                            Push To Talk
                        </Text>
                    </View>
                </View>
            </ImageBackground>

            <Modal 
            visible={modalVisible} 
            animationType='fade' 
            statusBarTranslucent 
            transparent>
                <View style={Styles.modalContainer}>
                    <View style={Styles.modalContainer1}>
                        <Text style={Styles.appRules}>
                            App Rules
                        </Text>
                        {
                            texts.map((item,index)=>{
                                return(
                                    <Text key={index} style={{marginBottom : 10, color : 'black'}}>
                                        {index+1}. {item}
                                    </Text>
                                )
                            })
                        }

                        <Pressable style={Styles.buttonContainer} onPress={()=>setModalVisible(false)}>
                            <Text style={Styles.btnText}>
                                I Understand
                            </Text>
                        </Pressable>

                    </View>
                </View>
            </Modal>
            <Modal visible={uidModalVisible} transparent statusBarTranslucent>
                <View style={{flex:1, justifyContent : 'center', alignItems : 'center'}}>
                    <View style={{width : 90+'%', backgroundColor : 'white', paddingVertical : 50, paddingHorizontal : 20, borderRadius : 10}}>
                    <TextInput
                    value={uid}
                    onChangeText={setUId}
                    keyboardType='numeric'
                    placeholder='Enter UID'
                    style={{borderRadius : 5, backgroundColor : 'rgb(230,230,230)', marginBottom : 10}}
                    />
                    <Button title='Save' onPress={()=>{
                        if(uid && /^[0-9]{1,}$/.test(uid)){
                            setUIdModalVisible(false);
                        }
                        else{
                            alert('Please enter valid UID. UID must be a number');
                        }
                    }}>
                    </Button>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const Styles = StyleSheet.create({
    container : {
        flex:1, 
        backgroundColor : 'white'
    },
    subContainer : {
        flex:1, 
        justifyContent : 'space-between'
    },
    subContainerChild1 : {
        marginTop : 30, 
        marginHorizontal : 15
    },
    subContainerChild2 : {
        alignItems : 'center', 
        backgroundColor : 'rgba(255,255,255,0.2)', 
        margin : 15, 
        borderRadius : 10, 
        padding : 20
    },
    modalContainer : {
        flex:1, 
        alignItems : 'center', 
        justifyContent : 'center', 
        backgroundColor: 'rgba(255,255,255,0.1)'
    },
    modalContainer1 : {
        borderRadius : 10, 
        backgroundColor : 'white', 
        width : 80+'%', 
        padding : 20, 
        elevation : 10
    },
    appRules : {
        fontWeight : 'bold', 
        color : 'black', 
        textAlign : 'center', 
        fontSize : 20, 
        marginBottom : 10
    },
    buttonContainer : {
        backgroundColor : 'black', 
        borderRadius : 30, 
        marginTop : 10
    },
    btnText : {
        color : 'white', 
        textAlign : 'center', 
        padding : 10
    },
    pushText : {
        fontSize : 35,
        fontWeight : 'bold', 
        color : 'black'
    }
})