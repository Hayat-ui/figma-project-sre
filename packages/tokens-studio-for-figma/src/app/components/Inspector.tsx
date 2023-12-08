import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ToggleGroup, Tooltip } from '@tokens-studio/ui';
import Box from './Box';
import InspectorDebugView from './InspectorDebugView';
import InspectorMultiView from './InspectorMultiView';
import IconDebug from '@/icons/debug.svg';
import IconInspect from '@/icons/multiinspect.svg';
import IconButton from './IconButton';
import { Dispatch } from '../store';
import Checkbox from './Checkbox';
import Label from './Label';
import { mergeTokenGroups } from '@/utils/tokenHelpers';
import { track } from '@/utils/analytics';
import {
  inspectDeepSelector,
  tokensSelector,
  usedTokenSetSelector,
} from '@/selectors';
import Input from './Input';
import InspectSearchOptionDropdown from './InspectSearchOptionDropdown';
import Stack from './Stack';
import { defaultTokenResolver } from '@/utils/TokenResolver';

function Inspector() {
  const [inspectView, setInspectView] = React.useState('multi');
  const { t } = useTranslation(['inspect']);
  const [searchInputValue, setSearchInputValue] = React.useState<string>('');
  const dispatch = useDispatch<Dispatch>();
  const tokens = useSelector(tokensSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const inspectDeep = useSelector(inspectDeepSelector);
  // TODO: Put this into state in a performant way
  const resolvedTokens = React.useMemo(() => (
    defaultTokenResolver.setTokens(mergeTokenGroups(tokens, usedTokenSet))
  ), [tokens, usedTokenSet]);

  const handleSetInspectView = React.useCallback((view: 'multi' | 'debug') => {
    track('setInspectView', { view });
    setInspectView(view);
  }, []);

  function renderInspectView() {
    switch (inspectView) {
      case 'debug': return <InspectorDebugView resolvedTokens={resolvedTokens} />;
      case 'multi': return <InspectorMultiView resolvedTokens={resolvedTokens} tokenToSearch={searchInputValue} />;
      default: return null;
    }
  }

  const handleSearchInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInputValue(event.target.value);
  }, []);

  const handleSetInspectDeep = React.useCallback(() => dispatch.settings.setInspectDeep(!inspectDeep), [dispatch, inspectDeep]);

  return (
    <Box css={{
      gap: '$2', flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
    }}
    >
      <Box css={{
        display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '$2', padding: '$4', borderBottom: '1px solid $borderMuted',
      }}
      >
        <Box
          css={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '$3',
          }}
        >
          <Input
            full
            value={searchInputValue}
            onChange={handleSearchInputChange}
            type="text"
            autofocus
            placeholder={`${t('search')}...`}
          />
        </Box>
        <Stack direction="row" align="center" gap={4}>
          <Stack direction="row" align="center" gap={2}>
            <Checkbox
              checked={inspectDeep}
              id="inspectDeep"
              onCheckedChange={handleSetInspectDeep}
            />
            <Tooltip label={t('scansSelected') as string} side="bottom">
              <Label htmlFor="inspectDeep">
                <Box css={{ fontWeight: '$sansBold', fontSize: '$small' }}>
                  {t('deepInspect')}
                </Box>
              </Label>
            </Tooltip>
          </Stack>
          <ToggleGroup type="single" value={inspectView} onValueChange={handleSetInspectView}>
            {/* Disabling tooltip for now due to https://github.com/radix-ui/primitives/issues/602
            <ToggleGroup.Item value="multi" tooltip={t('inspectLayers') as string} tooltipSide="bottom"> */}
            <ToggleGroup.Item value="multi">
              <IconInspect />
            </ToggleGroup.Item>
            {/* Disabling tooltip for now due to https://github.com/radix-ui/primitives/issues/602
              <ToggleGroup.Item value="debug" tooltip={t('debugAndAnnotate') as string} tooltipSide="bottom"> */}
            <ToggleGroup.Item value="debug">
              <IconDebug />
            </ToggleGroup.Item>
          </ToggleGroup>
          <InspectSearchOptionDropdown />
        </Stack>
      </Box>
      {renderInspectView()}
    </Box>
  );
}

export default Inspector;