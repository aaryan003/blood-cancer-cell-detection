import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { User, Mail, Phone, Building2, Shield, Key, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { APP_CONFIG, API_ENDPOINTS, ROLE_LABELS } from "../constants";
import { authService } from "../services/authService";
import { Alert, AlertDescription } from "./ui/alert";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  department: string;
  licenseNumber: string;
  hospital: { id: string; name: string } | null;
  createdAt: string;
}

export function UserProfile() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const storedUser = authService.getStoredUser();

  const fetchProfile = useCallback(async () => {
    if (!storedUser?.id) {
      setError("Not logged in. Please log in again.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(
        `${APP_CONFIG.apiUrl}${API_ENDPOINTS.AUTH.PROFILE}?userId=${storedUser.id}`
      );
      const json = await res.json();
      if (json.success && json.data?.user) {
        const u = json.data.user;
        setProfileData({
          id: u.id,
          name: u.name || "",
          email: u.email || "",
          role: u.role || "",
          phone: u.phone || "",
          department: u.department || "",
          licenseNumber: u.licenseNumber || "",
          hospital: u.hospital || null,
          createdAt: u.createdAt || "",
        });
      } else {
        setError("Failed to load profile.");
      }
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  }, [storedUser?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profileData) return;
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    if (!profileData) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(
        `${APP_CONFIG.apiUrl}${API_ENDPOINTS.AUTH.PROFILE}?userId=${profileData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: profileData.name,
            phone: profileData.phone,
            department: profileData.department,
            licenseNumber: profileData.licenseNumber,
          }),
        }
      );
      const json = await res.json();
      if (json.success) {
        setSuccess("Profile updated successfully!");
        // Update stored user data so the layout header reflects changes
        if (json.data?.user) {
          const u = json.data.user;
          localStorage.setItem(
            "userData",
            JSON.stringify({ id: u.id, name: u.name, email: u.email, role: u.role })
          );
        }
      } else {
        setError(json.message || "Failed to save profile.");
      }
    } catch {
      setError("Could not connect to server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-500">Loading profile...</span>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-4xl">
        <Alert variant="destructive">
          <AlertDescription>{error || "Could not load profile data."}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const roleLabel =
    (ROLE_LABELS as Record<string, string>)[profileData.role] || profileData.role;
  const memberSince = profileData.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "--";

  return (
    <div className="max-w-4xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-gray-900">User Profile</h1>
        <p className="text-gray-500 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Overview */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-12 h-12 text-blue-700" />
          </div>
          <div className="flex-1">
            <h2 className="text-gray-900">{profileData.name}</h2>
            <p className="text-gray-600 mt-1">{roleLabel}</p>
            {profileData.hospital && (
              <p className="text-sm text-gray-500 mt-1">{profileData.hospital.name}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">Member since {memberSince}</p>
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card className="p-6">
        <h3 className="text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                value={profileData.email}
                disabled
                className="pl-10 bg-gray-50"
              />
            </div>
            <p className="text-xs text-gray-400">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseNumber">Medical License Number</Label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="licenseNumber"
                name="licenseNumber"
                value={profileData.licenseNumber}
                onChange={handleInputChange}
                placeholder="Enter your license number"
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Professional Information */}
      <Card className="p-6">
        <h3 className="text-gray-900 mb-4">Professional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={roleLabel}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-400">Role is assigned by an administrator</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              name="department"
              value={profileData.department}
              onChange={handleInputChange}
              placeholder="Enter your department"
            />
          </div>

          {profileData.hospital && (
            <div className="space-y-2">
              <Label htmlFor="hospital">Hospital / Facility</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="hospital"
                  value={profileData.hospital.name}
                  disabled
                  className="pl-10 bg-gray-50"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6">
        <h3 className="text-gray-900 mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-900">Password</p>
                <p className="text-xs text-gray-500">Change your account password</p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>Change Password</Button>
          </div>
        </div>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={fetchProfile} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
