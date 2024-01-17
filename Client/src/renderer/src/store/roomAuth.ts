import {reactive} from 'vue';

interface roomAuth {
    roomId: string | null;
    password: string | null;
}

export const roomAuth: roomAuth = reactive({
    roomId: null,
    password: null,
});

export function updateRoomPassword(newPassword: string): void {
    roomAuth.password = newPassword;
}
