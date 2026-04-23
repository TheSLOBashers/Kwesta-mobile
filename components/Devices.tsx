import * as DEVICE from 'expo-device';
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "./ui/icon-symbol";

interface Props {
    devices: any
    handleBlock: (device: any) => void
}

interface Props2 {
    device: any
    handleBlock: (device: any) => void
}

interface Props3 {
    device_type: any
}

function DeviceIcon({ device_type }: Props3) {
    switch (device_type) {
        case DEVICE.DeviceType.DESKTOP:
            return (<IconSymbol size={75} name="desktopcomputer" color={"#ccc"} />);
        case DEVICE.DeviceType.PHONE:
            return (<IconSymbol size={75} name="phone" color={"#ccc"} />);
        case DEVICE.DeviceType.TABLET:
            return (<IconSymbol size={75} name="apps.ipad" color={"#ccc"} />);
        default:
            return (<IconSymbol size={75} name="questionmark" color={"#ccc"} />);
    }

}

function Device({ device, handleBlock }: Props2) {

    let device_type = Number(device.device_deviceType);

    return (
        <View style={styles.device}>
            <Text style={styles.title3}>{device.device}</Text>
            <View style={styles.splitBox}>
                <DeviceIcon device_type={device_type}></DeviceIcon>
                <View style={styles.takeoverBox}>
                    <Text style={styles.text}>{device.allowed ? "Device currently permitted." : "Device blocked."}</Text>
                    {device.allowed ? <Pressable style={styles.dButton} onPress={() => handleBlock(device.device)}><Text style={styles.dButtonText}>Block</Text></Pressable> : null}
                </View>
            </View>
        </View>
    );
}


export default function Devices({ devices, handleBlock }: Props) {

    const [open, setOpen] = useState(true);

    try {
        return (
            <View style={styles.devices}>
                <View style={styles.splitBox}>
                    <Text style={styles.title2}>Devices</Text>
                {open ? <Pressable onPress={() => setOpen(false)}><IconSymbol size={35} name="arrow.up" color={"#ccc"} /></Pressable>
                    : <Pressable onPress={() => setOpen(true)}><IconSymbol size={35} name="arrow.down" color={"#ccc"} /></Pressable>}

                </View>
                
                {open ?
                    (devices.map((d: any, i: any) => (
                        <View key={`${d._id}:${i}`}>
                            <Device device={d} handleBlock={handleBlock}></Device>
                        </View>
                    )))
                    : null}
            </View>
        );
    }
    catch (error) {
        return (<Text>Error loading devices.</Text>);
    };

}

const styles = StyleSheet.create({
    title2: {
        fontFamily: "Cocogoose",
        fontSize: 22,
        marginBottom: 10,
        color: '#ccc'
    },
    title3: {
        fontFamily: "Cocogoose",
        fontSize: 18,
        marginBottom: 10,
        color: '#ccc'
    },
    text: {
        fontFamily: "Acephimere",
        fontSize: 16,
        marginBottom: 9,
        color: '#ccc'
    },
    label: {
        fontSize: 18,
        marginTop: 10,
        marginBottom: 5
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5
    },
    dButton: {
        backgroundColor: 'orange',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center'
    },
    dButtonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    error: {
        color: 'red',
        fontWeight: 'bold',
        marginTop: 10
    },
    devices: {
        padding: "2%",
        margin: "1%",
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
    },
    device: {
        padding: "2%",
        paddingLeft: "4%",
        margin: "1%",
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
    },
    splitBox: {
        flexDirection: 'row',
    },
    takeoverBox: {
        flex: 1,
        paddingLeft: "3%"
    }
});