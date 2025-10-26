import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountLoginDialog } from '@/features/auth/components/account-login-dialog';
import { AccountStore } from '@/features/auth/store';
import { useAuthRehydration } from '@/shared/hooks';
import { PublicLanding } from './public-landing';

export function LandingPage() {
  const account = AccountStore((state) => state.account);
  const isAuthRehydrated = useAuthRehydration();
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthRehydrated) {
      return;
    }
    if (account) {
      navigate('/chat');
    }
  }, [account, isAuthRehydrated, navigate]);

  if (!isAuthRehydrated) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!account) {
    return (
      <>
        <AccountLoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
        <PublicLanding onOpenAuth={() => setLoginOpen(true)} />
      </>
    );
  }

  // const authedContent = (
  //   <div className="flex flex-col relative overflow-y-auto hide-scrollbar">
  //     {/* Grid Pattern Background */}
  //     <GridPattern
  //       width={40}
  //       height={40}
  //       strokeDasharray={'2 4'}
  //       squares={squares}
  //       className={cn(
  //         '[mask-image:linear-gradient(to_bottom,white,transparent,transparent)]',
  //         'dark:[mask-image:linear-gradient(to_bottom,black,transparent,transparent)]',
  //         'fill-muted/80 dark:fill-muted/20',
  //         'z-0',
  //       )}
  //     />

  //     {/* Main Content */}
  //     <div className="flex flex-col w-full">
  //       {/* Welcome Section */}
  //       <div className="min-h-[40vh] flex flex-col justify-center py-8 mt-10">
  //         <div className="flex flex-col items-center justify-center h-full min-h-0 px-4 z-10">
  //           <div className="flex flex-col items-center gap-8 w-full max-w-4xl">
  //             <motion.div
  //               initial={{ opacity: 0, y: -20 }}
  //               animate={{ opacity: 1, y: 0 }}
  //               transition={{ delay: 0.2 }}
  //               className="flex flex-col items-center gap-4"
  //             >
  //               <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
  //                 Get Started with every AI You Need
  //               </h1>
  //               <p className="text-muted-foreground text-center max-w-md">
  //                 Explore amazing AI capabilities
  //               </p>
  //             </motion.div>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Cap Store Content Section (lazy) */}
  //       <div className="flex-1 bg-background max-w-7xl mx-auto">
  //         {showHome ? (
  //           <Suspense
  //             fallback={
  //               <div className="p-6">
  //                 <CapStoreLoading count={12} />
  //               </div>
  //             }
  //           >
  //             <LazyCapStoreHomeContent />
  //           </Suspense>
  //         ) : (
  //           <div className="p-6">
  //             <CapStoreLoading count={9} />
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   </div>
  // );

  // return authedContent;
}
