import React, { useState } from "react";
import {createDrawerNavigator} from '@react-navigation/drawer';
import Home from "../Screens/Home";
import { Modal, Pressable, Text, View } from "react-native";


function DrawerContentMain({showAppRules, showDonateModal}){
    const data = [
        {
            title : 'Notifications',
            action : ()=> {}
        },
        {
            title : 'App Rules',
            action : ()=> {showAppRules?.()}
        },
        {
            title : 'Donate',
            action : ()=> {showDonateModal?.()}
        }
    ];
    return(
        <View style={{flex:1, backgroundColor : 'white'}}>
            <View style={{flex:1}}>
            <Text style={{color : 'black', fontSize : 20, textAlign : 'center', marginVertical : 20, fontWeight : 'bold', marginTop : 50}}>
                United
            </Text>
            <View style={{marginVertical : 20, padding : 10}}>
            {
                data.map((item,index)=>{
                    return(
                        <Pressable style={{marginVertical : 10}} key={index} onPress={()=>item.action?.()}>
                            <Text style={{fontWeight : 'bold', fontSize : 18, color : 'black'}}>
                                {item.title}
                            </Text>
                        </Pressable>
                    )
                })
            }
            </View>
            </View>
            <Text style={{textAlign : 'center', marginVertical : 20, textAlign : 'center'}}>
                Copy Right 2023
            </Text>
        </View>
    )
}

export function DrawerStack(){
    const Drawer = createDrawerNavigator();
    const [modalVisible, setModalVisible] = useState(false);
    const [donateModal, setDonateModal] = useState(false);

    const onChange=()=>{
        console.log('hello world');
    }

    const showAppRules=()=>{
        setModalVisible(true);
    }

    const showDonateModal=()=>{
        setDonateModal(true);
    }

    const texts = [
        "Keep Chitchat to minimum",
        "Say position when reporting a hazard(2 miles after junction 42, oil on line 1)",
        "No abuse of other users",
        "anything illegal should not be discussed"
    ];
    return(
        <View style={{flex:1}}>
        <Drawer.Navigator drawerContent={()=><DrawerContentMain showAppRules={showAppRules} showDonateModal={showDonateModal}/>} screenOptions={{headerShown : false}}>
            <Drawer.Screen name="Home">
                {props => <Home {...props} modalVisible={modalVisible} />}
            </Drawer.Screen>
        </Drawer.Navigator>

        <Modal visible={modalVisible} animationType='fade' statusBarTranslucent transparent>
                <View style={{flex:1, alignItems : 'center', justifyContent : 'center', backgroundColor: 'rgba(255,255,255,0.1)'}}>
                    <View style={{borderRadius : 10, backgroundColor : 'white', width : 80+'%', padding : 20, elevation : 10}}>
                        <Text style={{fontWeight : 'bold', color : 'black', textAlign : 'center', fontSize : 20, marginBottom : 10}}>
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

                        <Pressable style={{backgroundColor : 'black', borderRadius : 30, marginTop : 10}} onPress={()=>setModalVisible(false)}>
                            <Text style={{color : 'white', textAlign : 'center', padding : 10}}>
                                I Understand
                            </Text>
                        </Pressable>

                    </View>
                </View>
            </Modal>

            <Modal visible={donateModal} animationType='fade' statusBarTranslucent transparent>
                <View style={{flex:1, alignItems : 'center', justifyContent : 'center', backgroundColor: 'rgba(255,255,255,0.1)'}}>
                    <View style={{borderRadius : 10, backgroundColor : 'white', width : 80+'%', padding : 20, elevation : 10}}>
                        <Text style={{fontWeight : 'bold', color : 'black', textAlign : 'center', fontSize : 20, marginBottom : 10}}>
                            Donate
                        </Text>
                        {
                            ["Please donate to support our app"].map((item,index)=>{
                                return(
                                    <Text key={index} style={{marginBottom : 10, color : 'black', textAlign : 'center'}}>
                                        {item}
                                    </Text>
                                )
                            })
                        }
                        <View style={{flexDirection : 'row',alignSelf : 'center'}}>
                        {
                            ['50p','E1','E2'].map((item,index)=>{
                                return(
                                    <Pressable key={index} onPress={()=>{setDonateModal(false)}} style={{width : 40, height : 40, borderRadius : 50, justifyContent : 'center', alignItems : 'center', borderWidth : 3, marginHorizontal : 10}}>
                                        <Text style={{color : 'black', fontWeight : 'bold'}}>
                                            {item}
                                        </Text>
                                    </Pressable>
                                )
                            })
                        }
                        </View>

                    </View>
                </View>
            </Modal>
        </View>
    )
}