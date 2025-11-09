import { StyleSheet } from 'react-native';

const COLORS = {
    primary: '#5B21B6',
    background: '#FFFFFF',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    inputBackground: 'rgba(255, 255, 255, 0.9)',
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '100%',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        width: '90%',
        maxWidth: 400,
        alignItems: 'center',
        padding: 20,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
    },
    logoText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#433890',
        marginLeft: 8,
    },
    title: {
        fontSize: 34,
        fontWeight: '700',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 30,
    },
    inputWrapper: {
        width: '100%',
        height: 55,
        backgroundColor: COLORS.inputBackground,
        borderRadius: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        justifyContent: 'center',
    },
    inputWrapperFocused: {
        width: '100%',
        height: 55,
        borderRadius: 16,
        marginBottom: 15,
        padding: 1.5,
        shadowColor: '#A78BFA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    input: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.inputBackground,
        borderRadius: 14,
        paddingHorizontal: 20,
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    button: {
        width: '100%',
        backgroundColor: COLORS.primary,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    bottomLinksContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    linkText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
});

export default styles;