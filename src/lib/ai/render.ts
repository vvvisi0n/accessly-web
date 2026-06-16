export async function generateRender(layoutType: "2D" | "3D", context: string) {
  return {
    message: `Generated ${layoutType} render for ${context} successfully.`,
    url: `/renders/${context.toLowerCase()}-${layoutType}.png`,
  };
}
