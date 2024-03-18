import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AnyTokenList } from '@/types/tokens';
import { SettingsState } from '@/app/store/models/settings';
import updateVariables from './updateVariables';
import { ReferenceVariableType } from './setValuesOnVariable';
import updateVariablesToReference from './updateVariablesToReference';
import createVariableMode from './createVariableMode';
import { notifyUI } from './notifiers';
import { ThemeObject } from '@/types';

export type LocalVariableInfo = {
  collectionId: string;
  modeId: string;
  variableIds: Record<string, string>
};
export default async function createLocalVariablesWithoutModesInPlugin(tokens: Record<string, AnyTokenList>, settings: SettingsState, selectedSets: string[]) {
  // Big O (n * m * x): (n: amount of themes, m: amount of variableCollections, x: amount of modes)
  console.log('selectedSets: ', selectedSets);
  console.log('createLocalVariablesWithoutModes');
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  console.log('themeInfo: ', themeInfo);
  const allVariableCollectionIds: Record<string, LocalVariableInfo> = {};
  let referenceVariableCandidates: ReferenceVariableType[] = [];
  themeInfo.themes.forEach((theme) => {
    console.log('1111111111111111111');
    const collection = figma.variables.getLocalVariableCollections().find((vr) => vr.name === (theme.group ?? theme.name));
    if (collection) {
      const mode = collection.modes.find((m) => m.name === theme.name);
      const modeId: string = mode?.modeId ?? createVariableMode(collection, theme.name);
      if (modeId) {
        const allVariableObj = updateVariables({
          collection, mode: modeId, theme, tokens, settings,
        });
        if (Object.keys(allVariableObj.variableIds).length > 0) {
          allVariableCollectionIds[theme.id] = {
            collectionId: collection.id,
            modeId,
            variableIds: allVariableObj.variableIds,
          };
          referenceVariableCandidates = referenceVariableCandidates.concat(allVariableObj.referenceVariableCandidate);
        }
      }
    } else {
      const newCollection = figma.variables.createVariableCollection(theme.group ?? theme.name);
      newCollection.renameMode(newCollection.modes[0].modeId, theme.name);
      const allVariableObj = updateVariables({
        collection: newCollection, mode: newCollection.modes[0].modeId, theme, tokens, settings,
      });
      if (Object.keys(allVariableObj.variableIds).length > 0) {
        allVariableCollectionIds[theme.id] = {
          collectionId: newCollection.id,
          modeId: newCollection.modes[0].modeId,
          variableIds: allVariableObj.variableIds,
        };
        referenceVariableCandidates = referenceVariableCandidates.concat(allVariableObj.referenceVariableCandidate);
      }
    }
  });
  const figmaVariables = figma.variables.getLocalVariables();
  console.log('figmaVariables: ', figmaVariables);
  updateVariablesToReference(figmaVariables, referenceVariableCandidates);
  const localCollections = figma.variables.getLocalVariableCollections();
  console.log('localCollections: ', localCollections);
  if (figmaVariables.length === 0) {
    notifyUI('No variables were created');
  } else {
    notifyUI(`${figma.variables.getLocalVariableCollections().length} collections and ${figmaVariables.length} variables created`);
  }
  return {
    allVariableCollectionIds,
    totalVariables: figmaVariables.length,
  };
}