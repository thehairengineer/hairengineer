export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Add debugging to verify this layout is being used
  console.log('Rendering login layout - NO AUTH CHECKS HERE');
  
  // No redirects or authentication checks for the login page
  // This is just a simple wrapper
  return (
    <div className="admin-login-layout">
      {children}
    </div>
  );
} 