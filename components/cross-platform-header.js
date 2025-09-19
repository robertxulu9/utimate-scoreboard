"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MoreVertical } from "lucide-react"
import { usePlatform } from "@/hooks/use-platform"
import { cn } from "@/lib/utils"

export function CrossPlatformHeader({ title, subtitle, onBack, canGoBack = false, actions = [], className }) {
  const { isMobile, isTablet } = usePlatform()

  return (
    <div
      className={cn(
        "flex items-center justify-between mb-6 p-4",
        {
          // Mobile: sticky header with backdrop blur
          "sticky top-0 bg-background/95 backdrop-blur-sm border-b z-40 -mx-4 mb-4": isMobile,
          // Desktop: regular header
          relative: !isMobile,
        },
        className,
      )}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {canGoBack && (
          <Button
            variant="outline"
            size={isMobile ? "sm" : "icon"}
            onClick={onBack}
            className={cn({
              "px-3": isMobile,
            })}
          >
            <ArrowLeft className="h-4 w-4" />
            {isMobile && <span className="ml-1">Back</span>}
          </Button>
        )}

        <div className="flex-1 min-w-0">
          <h1 className={cn("font-bold text-balance truncate", isMobile ? "text-xl" : "text-3xl")}>{title}</h1>
          {subtitle && (
            <div className="mt-1">
              {typeof subtitle === "string" ? (
                <Badge variant="secondary" className="text-xs">
                  {subtitle}
                </Badge>
              ) : (
                subtitle
              )}
            </div>
          )}
        </div>
      </div>

      {actions.length > 0 && (
        <div className="flex items-center gap-2 ml-4">
          {isMobile && actions.length > 2 ? (
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          ) : (
            actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size={isMobile ? "sm" : action.size || "default"}
                onClick={action.onClick}
                className={action.className}
              >
                {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                {(!isMobile || action.showTextOnMobile) && action.label}
              </Button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
