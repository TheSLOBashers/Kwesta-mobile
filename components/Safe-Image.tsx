import React, { useState } from 'react';
import { Image } from 'react-native';

export default function SafeImage({ uri }: { uri: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) return null;

  return (
    <Image
      source={{
        uri: uri,
        cache: 'reload'
      }}
      style={{ width: 50, height: 50 }}
      onError={(e) => {
        setHasError(true);
      }}
    />
  );
}