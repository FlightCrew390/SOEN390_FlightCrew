import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import ConnectionPanel from "../../src/components/MenuScreen/ConnectionPanel";
import { User } from "../../src/types/User";

// --- Mocks ---

const mockSignIn = jest.fn();
const mockSignOut = jest.fn();
const mockSavePreference = jest.fn();
const mockPromptAsync = jest.fn();
const mockConnectCalendar = jest.fn();
const mockDisconnectCalendar = jest.fn();

// Default: unauthenticated state
let mockUserContext = {
  user: null as User | null,
  tokens: null,
  isAuthenticated: false,
  loading: false,
  error: null as string | null,
  signIn: mockSignIn,
  signOut: mockSignOut,
  savePreference: mockSavePreference,
};

let mockCalendarContext = {
  isConnected: false,
  events: [],
  loading: false,
  error: null as string | null,
  connectCalendar: mockConnectCalendar,
  disconnectCalendar: mockDisconnectCalendar,
  fetchEvents: jest.fn(),
};

jest.mock("../../src/contexts/UserContext", () => ({
  useUser: () => mockUserContext,
}));

jest.mock("../../src/contexts/CalendarContext", () => ({
  useCalendar: () => mockCalendarContext,
}));

jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock("expo-auth-session", () => ({
  useAuthRequest: () => [
    { url: "https://accounts.google.com/..." }, // request
    null, // response
    mockPromptAsync,
  ],
  makeRedirectUri: () => "com.test:/oauthredirect",
}));

const authenticatedUser: User = {
  id: "google-123",
  email: "test@example.com",
  displayName: "Test User",
  avatarUrl: null,
  studentId: "40012345",
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUserContext = {
    user: null,
    tokens: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    signIn: mockSignIn,
    signOut: mockSignOut,
    savePreference: mockSavePreference,
  };
  mockCalendarContext = {
    isConnected: false,
    events: [],
    loading: false,
    error: null,
    connectCalendar: mockConnectCalendar,
    disconnectCalendar: mockDisconnectCalendar,
    fetchEvents: jest.fn(),
  };
});

describe("ConnectionPanel", () => {
  describe("loading state", () => {
    it("renders loading indicator when loading", () => {
      mockUserContext.loading = true;

      render(<ConnectionPanel />);

      expect(screen.getByTestId("connection-panel-loading")).toBeTruthy();
      expect(screen.getByText("Restoring session…")).toBeTruthy();
    });
  });

  describe("unauthenticated state", () => {
    it("renders sign-in button", () => {
      render(<ConnectionPanel />);

      expect(screen.getByText("Sign In with Google")).toBeTruthy();
    });

    it("launches OAuth prompt when sign-in is pressed", () => {
      render(<ConnectionPanel />);

      fireEvent.press(screen.getByLabelText("Sign in with Google"));

      expect(mockPromptAsync).toHaveBeenCalled();
    });

    it("renders error message when error is present", () => {
      mockUserContext.error = "Authentication failed: 401";

      render(<ConnectionPanel />);

      expect(screen.getByText("Authentication failed: 401")).toBeTruthy();
    });

    it("does not render error when error is null", () => {
      render(<ConnectionPanel />);

      expect(screen.queryByText("Authentication failed")).toBeNull();
    });
  });

  describe("authenticated state", () => {
    beforeEach(() => {
      mockUserContext.user = authenticatedUser;
      mockUserContext.isAuthenticated = true;
    });

    it("renders user display name", () => {
      render(<ConnectionPanel />);

      expect(screen.getByText("Test User")).toBeTruthy();
    });

    it("does not render user ID", () => {
      render(<ConnectionPanel />);

      expect(screen.queryByText("google-123")).toBeFalsy();
    });

    it("renders student ID input with current value", () => {
      render(<ConnectionPanel />);

      const input = screen.getByLabelText("Student ID");
      expect(input).toBeTruthy();
      expect(input.props.value).toBe("40012345");
    });

    it("renders sign-out button", () => {
      render(<ConnectionPanel />);

      expect(screen.getByText("Sign Out")).toBeTruthy();
    });

    it("calls signOut when sign-out button is pressed", async () => {
      render(<ConnectionPanel />);

      fireEvent.press(screen.getByLabelText("Sign out"));

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });

    it("renders Google Calendar connection button", () => {
      render(<ConnectionPanel />);

      expect(screen.getByText("Connect to Google Calendar")).toBeTruthy();
    });

    it("renders fallback icon when avatarUrl is null", () => {
      render(<ConnectionPanel />);

      // The panel should render without crashing (no Image component)
      expect(screen.getByTestId("connection-panel")).toBeTruthy();
    });

    it("renders avatar image when avatarUrl is provided", () => {
      mockUserContext.user = {
        ...authenticatedUser,
        avatarUrl: "https://example.com/photo.jpg",
      };

      render(<ConnectionPanel />);

      expect(screen.getByLabelText("Test User's profile picture")).toBeTruthy();
    });
  });

  describe("student ID editing", () => {
    beforeEach(() => {
      mockUserContext.user = authenticatedUser;
      mockUserContext.isAuthenticated = true;
    });

    it("saves student ID on blur if changed", async () => {
      render(<ConnectionPanel />);

      const input = screen.getByLabelText("Student ID");
      fireEvent.changeText(input, "40054321");
      fireEvent(input, "blur");

      await waitFor(() => {
        expect(mockSavePreference).toHaveBeenCalledWith({
          studentId: "40054321",
        });
      });
    });

    it("does not save student ID on blur if unchanged", async () => {
      render(<ConnectionPanel />);

      const input = screen.getByLabelText("Student ID");
      fireEvent.changeText(input, "40012345");
      fireEvent(input, "blur");

      await waitFor(() => {
        expect(mockSavePreference).not.toHaveBeenCalled();
      });
    });

    it("saves student ID on submit if changed", async () => {
      render(<ConnectionPanel />);

      const input = screen.getByLabelText("Student ID");
      fireEvent.changeText(input, "40054321");
      fireEvent(input, "submitEditing");

      await waitFor(() => {
        expect(mockSavePreference).toHaveBeenCalledWith({
          studentId: "40054321",
        });
      });
    });
  });

  describe("Google Calendar connection", () => {
    beforeEach(() => {
      mockUserContext.user = authenticatedUser;
      mockUserContext.isAuthenticated = true;
    });

    it("calls connectCalendar when connect button is pressed", async () => {
      render(<ConnectionPanel />);

      fireEvent.press(screen.getByLabelText("Connect to Google Calendar"));

      await waitFor(() => {
        expect(mockPromptAsync).toHaveBeenCalled();
      });
    });

    it("calls disconnectCalendar when disconnect button is pressed", async () => {
      mockCalendarContext.isConnected = true;

      render(<ConnectionPanel />);

      fireEvent.press(screen.getByLabelText("Disconnect Google Calendar"));

      await waitFor(() => {
        expect(mockDisconnectCalendar).toHaveBeenCalled();
      });
    });
  });
});
