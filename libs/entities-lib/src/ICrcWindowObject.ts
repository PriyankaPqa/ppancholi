export interface ICrcWindowObject extends Window {
    crcSingletons?: { signalR?: { addSubscription: (id: string) => void } }
}
