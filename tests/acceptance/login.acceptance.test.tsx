import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { defineFeature, loadFeature } from "jest-cucumber";
import React from "react";

import Login from "../../app/context/(auth)/Login";
import loginCall from "../../scripts/loginCall";

jest.mock("expo-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("expo-device", () => ({
  brand: "AcceptanceBrand",
  designName: "AcceptanceDesign",
  deviceName: "AcceptanceDevice",
  deviceYearClass: 2026,
  deviceType: "phone",
}));

jest.mock("../../components/auth-context", () => ({
  useAuth: () => ({
    moderator: null,
    setUsernameAs: jest.fn(),
    setTokenAs: jest.fn(),
    setMod: jest.fn(),
    token: null,
  }),
}));

jest.mock("../../scripts/loginCall", () => ({
  __esModule: true,
  default: jest.fn(() => new Promise(() => undefined)),
}));

const feature = loadFeature("./tests/acceptance/features/login.feature");

defineFeature(feature, (test) => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Submit credentials from the login screen", ({ given, when, and, then }) => {
    let screen: ReturnType<typeof render>;

    given("the login screen is open", () => {
      screen = render(<Login />);
      expect(screen.getByText("Login")).toBeTruthy();
    });

    when("I enter a username and password", () => {
      fireEvent.changeText(screen.getByPlaceholderText("Username"), "acceptance-user");
      fireEvent.changeText(screen.getByPlaceholderText("Password"), "Acceptance123!");
    });

    and("I submit the login form", () => {
      fireEvent.press(screen.getByText("Submit"));
    });

    then("the app should call the login service with those credentials", async () => {
      await waitFor(() => {
        expect(loginCall).toHaveBeenCalledWith(
          "acceptance-user",
          "Acceptance123!",
          expect.any(Function),
          expect.any(Function),
          expect.any(Function),
          expect.any(Function),
          "AcceptanceBrand",
          "AcceptanceDesign",
          "AcceptanceDevice",
          "2026",
          "phone",
        );
      });
    });
  });
});


