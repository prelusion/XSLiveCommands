import {reactive} from 'vue';

interface roomAuth {
    roomId: string | null;
    password: string | null;
}

export const roomAuth: roomAuth = reactive({
    roomId: null,
    password: null,
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function updateRoomPassword(newPassword: string) {
    roomAuth.password = newPassword;
}
