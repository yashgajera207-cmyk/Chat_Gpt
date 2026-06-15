"use client";

import { useMutation } from "@tanstack/react-query";

export const useChat = () => {
    return useMutation({
        mutationFn: async (message: string) => {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error("Failed to send message");
            }

            return response.json();
        },
    });
};