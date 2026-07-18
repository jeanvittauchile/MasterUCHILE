import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { isValidPin } from '@masteruchile/shared';
import { PinPad } from '../../components/forms/PinPad';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useChangePin } from '../../api/hooks/useAuth';
import { colors, fonts } from '../../theme/tokens';

export function ChangePinScreen() {
  const [step, setStep] = useState<'new' | 'repeat'>('new');
  const [pinNuevo, setPinNuevo] = useState('');
  const [pinRepetido, setPinRepetido] = useState('');
  const changePin = useChangePin();

  const mismatch = step === 'repeat' && pinRepetido.length === 4 && pinRepetido !== pinNuevo;

  const currentValue = step === 'new' ? pinNuevo : pinRepetido;
  const onChangeDigits = (v: string) => {
    if (step === 'new') {
      setPinNuevo(v);
      if (v.length === 4 && isValidPin(v)) setStep('repeat');
    } else {
      setPinRepetido(v);
      if (v.length === 4) {
        if (v === pinNuevo) {
          changePin.mutate({ pinNuevo, pinRepetido: v });
        }
      }
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.column}>
        <Text style={styles.title}>Primer ingreso</Text>
        <Text style={styles.subtitle}>
          {step === 'new' ? 'Crea tu nuevo PIN de 4 dígitos' : 'Repite tu nuevo PIN para confirmarlo'}
        </Text>
        <PinPad value={currentValue} onChange={onChangeDigits} />
        {mismatch ? <Text style={styles.error}>Los PIN no coinciden, intenta de nuevo</Text> : null}
        {changePin.isError ? <Text style={styles.error}>{changePin.error.message}</Text> : null}
        {step === 'repeat' ? (
          <PrimaryButton
            label="VOLVER A EMPEZAR"
            variant="outline"
            onPress={() => {
              setStep('new');
              setPinNuevo('');
              setPinRepetido('');
            }}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, padding: 24, paddingTop: 90, alignItems: 'center' },
  column: { width: '100%', maxWidth: 420, gap: 18 },
  title: { fontFamily: fonts.oswaldBold, fontSize: 24, color: colors.navy },
  subtitle: { fontFamily: fonts.barlowRegular, fontSize: 14, color: colors.textSecondary },
  error: { color: colors.red, fontSize: 12.5, textAlign: 'center', fontFamily: fonts.barlowSemiBold },
});
