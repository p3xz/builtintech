"use client";

import React from "react";

export function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-zinc-800/60 rounded-lg ${className}`} />
  );
}

/**
 * Skeleton for individual course card in the /learn directory
 */
export function CourseCardSkeleton() {
  return (
    <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden animate-pulse">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-zinc-800" />
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <SkeletonBox className="w-10 h-10 rounded-xl" />
            <SkeletonBox className="w-16 h-5 rounded-md" />
          </div>
          <SkeletonBox className="w-14 h-5 rounded-full" />
        </div>
        <SkeletonBox className="w-3/4 h-6 mb-2.5" />
        <SkeletonBox className="w-full h-4 mb-1.5" />
        <SkeletonBox className="w-5/6 h-4 mb-4" />

        <div className="space-y-2 pt-2 border-t border-zinc-800/60">
          <div className="flex justify-between items-center">
            <SkeletonBox className="w-20 h-4" />
            <SkeletonBox className="w-16 h-4" />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800/80 mt-6">
        <SkeletonBox className="w-full h-10 rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Grid of Course Card Skeletons
 */
export function CourseGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for /learn/[courseId] course syllabus & module progression chain
 */
export function CourseOverviewSkeleton() {
  return (
    <div className="max-w-6xl mx-auto w-full py-8 px-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-8 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <SkeletonBox className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <SkeletonBox className="w-48 h-7" />
            <SkeletonBox className="w-32 h-4" />
          </div>
        </div>
        <SkeletonBox className="w-full h-4 mb-2" />
        <SkeletonBox className="w-4/5 h-4 mb-6" />
        <div className="flex gap-4">
          <SkeletonBox className="w-28 h-6 rounded-md" />
          <SkeletonBox className="w-28 h-6 rounded-md" />
          <SkeletonBox className="w-28 h-6 rounded-md" />
        </div>
      </div>

      {/* Module List Skeletons */}
      <div className="space-y-4">
        <SkeletonBox className="w-40 h-6 mb-4" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#121214] border border-zinc-800/80 rounded-xl p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <SkeletonBox className="w-8 h-8 rounded-full" />
              <div className="space-y-2">
                <SkeletonBox className="w-48 h-5" />
                <SkeletonBox className="w-72 h-3.5" />
              </div>
            </div>
            <SkeletonBox className="w-24 h-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for Interactive Lesson Content (/learn/[courseId]/[moduleId]/[lessonId])
 */
export function LessonContentSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full py-6 px-4 animate-pulse">
      {/* Left Lesson Prose Column */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <SkeletonBox className="w-24 h-5 rounded-md" />
          <SkeletonBox className="w-3/4 h-8" />
          <SkeletonBox className="w-full h-4" />
          <SkeletonBox className="w-5/6 h-4" />
          <SkeletonBox className="w-full h-32 rounded-xl" />
          <SkeletonBox className="w-4/5 h-4" />
          <SkeletonBox className="w-3/4 h-4" />
        </div>
      </div>

      {/* Right Interactive Code Runner Column */}
      <div className="lg:col-span-6 space-y-4">
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <SkeletonBox className="w-32 h-5" />
            <SkeletonBox className="w-20 h-5" />
          </div>
          <SkeletonBox className="w-full h-64 rounded-xl" />
          <div className="flex justify-end gap-3">
            <SkeletonBox className="w-24 h-9 rounded-lg" />
            <SkeletonBox className="w-28 h-9 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Checkpoint Quiz (/learn/[courseId]/[moduleId]/quiz)
 */
export function QuizSkeleton() {
  return (
    <div className="max-w-3xl mx-auto w-full py-8 px-4 animate-pulse">
      <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <SkeletonBox className="w-48 h-6" />
          <SkeletonBox className="w-20 h-6 rounded-full" />
        </div>

        <SkeletonBox className="w-full h-6" />

        <div className="space-y-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBox key={i} className="w-full h-14 rounded-xl" />
          ))}
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-zinc-800">
          <SkeletonBox className="w-24 h-8 rounded-lg" />
          <SkeletonBox className="w-32 h-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Learner Dashboard (/dashboard)
 */
export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 space-y-8 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-3">
          <SkeletonBox className="w-32 h-5 rounded-md" />
          <SkeletonBox className="w-64 h-8" />
          <SkeletonBox className="w-80 h-4" />
        </div>
        <div className="flex gap-4">
          <SkeletonBox className="w-28 h-16 rounded-xl" />
          <SkeletonBox className="w-28 h-16 rounded-xl" />
          <SkeletonBox className="w-28 h-16 rounded-xl" />
        </div>
      </div>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SkeletonBox className="w-48 h-6" />
          <SkeletonBox className="w-full h-44 rounded-2xl" />
          <SkeletonBox className="w-full h-44 rounded-2xl" />
        </div>
        <div className="space-y-6">
          <SkeletonBox className="w-40 h-6" />
          <SkeletonBox className="w-full h-64 rounded-2xl" />
          <SkeletonBox className="w-full h-40 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Achievements & Badges
 */
export function AchievementsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-[#121214] border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
          <SkeletonBox className="w-12 h-12 rounded-xl" />
          <div className="space-y-2 flex-1">
            <SkeletonBox className="w-28 h-4" />
            <SkeletonBox className="w-40 h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}
