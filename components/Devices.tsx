import * as DEVICE from 'expo-device';
import { useState } from "react";
import { ColorSchemeName, Pressable, StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "./ui/icon-symbol";

interface Props {
    devices: any
    handleBlock: (device: any) => void
    colorScheme: ColorSchemeName
}

interface Props2 {
    device: any
    handleBlock: (device: any) => void
    colorScheme: ColorSchemeName
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

function Device({ device, handleBlock, colorScheme }: Props2) {

    let device_type = Number(device.device_deviceType);
    const [pressed, setPressed] = useState(false);

    return (
        <View style={[styles.device, { backgroundColor:
          colorScheme === "dark" ? "rgba(255, 255, 255, 0.05)" : "#ecf3f5f3", }]}>
            <Text style={styles.title3}>{device.device}</Text>
            <View style={styles.splitBox}>
                <DeviceIcon device_type={device_type}></DeviceIcon>
                <View style={styles.takeoverBox}>
                    <Text style={styles.text}>{device.allowed ? "Device currently permitted." : "Device blocked."}</Text>
                    {device.allowed ?
                        (pressed ?
                            <>
                            <Pressable style={[styles.dButton, { backgroundColor: colorScheme === "dark" ? "rgba(255, 255, 255, 0.50)" : "rgba(255, 255, 255, 0.90)" }]} onPress={() => { handleBlock(device.device); }}><Text style={colorScheme === "dark" ? styles.dButtonText : styles.dButtonTextLight}>Confirm</Text></Pressable>
                            <Pressable style={[styles.dButtonWhite, { backgroundColor: colorScheme === "dark" ? "rgba(255, 255, 255, 0.10)" : "rgba(157, 173, 177, 0.9)" }]} onPress={() => { setPressed(false); }}><Text style={colorScheme === "dark" ? styles.dButtonText : styles.dButtonText}>Undo</Text></Pressable>
                            </>
                            : <Pressable style={[styles.dButton, { backgroundColor: colorScheme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.90)" }]} onPress={() => { setPressed(true); alert("Blocking this device cannot be undone.") }}><Text style={colorScheme === "dark" ? styles.dButtonText : styles.dButtonTextLight}>Block</Text></Pressable>
                        )
                        : null}
                </View>
            </View>
        </View>
    );
}


export default function Devices({ devices, handleBlock, colorScheme }: Props) {

    const [open, setOpen] = useState(false);

    try {
        return (
            <View style={styles.devices}>
                <View style={styles.splitBox}>
                    {open ? <Pressable onPress={() => setOpen(false)}><IconSymbol size={35} name="arrow.up" color={"#ccc"} /></Pressable>
                        : <Pressable onPress={() => setOpen(true)}><IconSymbol size={35} name="arrow.down" color={"#ccc"} /></Pressable>}

                </View>

                {open ?
                    (devices.map((d: any, i: any) => (
                        <View key={`${d._id}:${i}`}>
                            <Device device={d} handleBlock={handleBlock} colorScheme={colorScheme}></Device>
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
        alignItems: 'center',
        margin: 3
    },
    dButtonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    dButtonTextLight: {
        color: '#ccc',
        fontWeight: 'bold'
    },
    dButtonWhite: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        margin: 3
    },
    dButtonTextWhite: {
        color: '#151515',
        fontWeight: 'bold'
    },
    error: {
        color: 'red',
        fontWeight: 'bold',
        marginTop: 10
    },
    devices: {
        padding: "2%",
        margin: "0%",
    },
    device: {
        padding: "2%",
        paddingLeft: "4%",
        margin: "1%"
    },
    splitBox: {
        flexDirection: 'row',
    },
    takeoverBox: {
        flex: 1,
        paddingLeft: "3%"
    }
});