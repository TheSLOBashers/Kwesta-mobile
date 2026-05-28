import { useEffect, useState } from "react";
import {
    Image,
    ImageSourcePropType,
    ImageStyle,
    StyleProp,
} from "react-native";

import getProfilePhotoCall from "@/scripts/getProfilePhotoCall";

const placeholderProfilePhoto = require("@/assets/images/profile-placeholder.png");

type ProfilePhotoProps = {
  username: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
};

const ProfilePhoto = ({ username, size = 72, style }: ProfilePhotoProps) => {
  const [photoSource, setPhotoSource] = useState<ImageSourcePropType>(
    placeholderProfilePhoto,
  );

  useEffect(() => {
    let active = true;

    const loadProfilePhoto = async () => {
      if (username === "") {
        setPhotoSource(placeholderProfilePhoto);
        return;
      }

      const imageUrl = await getProfilePhotoCall(username);

      if (!active) return;

      if (!imageUrl) {
        setPhotoSource(placeholderProfilePhoto);
        return;
      }

      setPhotoSource({ uri: imageUrl });
    };

    loadProfilePhoto();

    return () => {
      active = false;
    };
  }, [username]);

  return (
    <Image
      source={photoSource}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "rgba(0,0,0,0.08)",
        },
        style,
      ]}
    />
  );
};

export default ProfilePhoto;
