import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';

const today = new Intl.DateTimeFormat('es', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}).format(new Date());

export default function AgendaScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.brand}>SECUREPLAN</Text>
        <Text style={styles.title}>Agenda</Text>
        <Text style={styles.date}>{today}</Text>

        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Tu día, bajo control</Text>
          <Text style={styles.emptyDescription}>
            Aquí aparecerán tus próximos eventos.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7F5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  brand: {
    color: '#28715E',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 20,
    color: '#172D27',
    fontSize: 32,
    fontWeight: '700',
  },
  date: {
    marginTop: 6,
    color: '#63746E',
    fontSize: 16,
    textTransform: 'capitalize',
  },
  emptyState: {
    marginTop: 32,
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE8E3',
  },
  emptyTitle: {
    color: '#172D27',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyDescription: {
    marginTop: 8,
    color: '#63746E',
    fontSize: 15,
    lineHeight: 22,
  },
});