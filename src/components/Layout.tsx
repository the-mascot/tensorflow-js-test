import ResponsiveAppBar from 'src/components/ResponsiveAppBar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ResponsiveAppBar />
      {children}
    </>
  )
}
