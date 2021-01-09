import React from 'react';
import { HelperText, TextInput } from 'react-native-paper';

const CustomTextInput = ({
  disabled,
  error,
  onChange,
  label,
  multiline,
  flat,
  value,
  keyboardType,
  autoCapitalize,
  secureTextEntry,
}) => (
  <>
    <TextInput
      disabled={disabled}
      error={error}
      label={label || 'Label'}
      mode={flat ? 'flat' : 'outlined'}
      multiline={multiline}
      numberOfLines={multiline && 5}
      onChangeText={onChange}
      value={value}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      secureTextEntry={secureTextEntry}
    />
    <HelperText type="error" visible={!!error}>
      {error}
    </HelperText>
  </>
);

export default CustomTextInput;
