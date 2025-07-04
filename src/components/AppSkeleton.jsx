import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const AppSkeleton = () => {
  return (
    <div className="min-h-screen bg-tubepro-dark text-white flex">
      {/* Sidebar Skeleton */}
      <div className={cn('hidden md:block w-64 bg-tubepro-darkAccent border-r border-white/10 p-4')}>
        <div className="flex items-center justify-between mb-10">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-7 w-7" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-20 mb-4 ml-4" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 px-3 py-3">
                <Skeleton className="h-6 w-6 rounded-md" />
                <Skeleton className="h-6 w-32 rounded-md" />
              </div>
            ))}
          </div>
          <Skeleton className="h-4 w-20 mb-4 ml-4 mt-6" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 px-3 py-3">
                <Skeleton className="h-6 w-6 rounded-md" />
                <Skeleton className="h-6 w-32 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="flex-1 p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-40" />
          </div>
        </div>

        {/* Dashboard Welcome Card Skeleton */}
        <Skeleton className="h-40 w-full rounded-xl mb-10" />

        {/* Tool Section Skeleton */}
        <div className="mb-10">
          <div className="mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppSkeleton;