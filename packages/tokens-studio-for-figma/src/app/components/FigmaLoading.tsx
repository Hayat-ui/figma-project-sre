import React, { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Spinner, Stack } from '@tokens-studio/ui';
import FigmaMark from '@/icons/figma-mark.svg';
import FigmaLetter from '@/icons/figma-letter.svg';
import * as pjs from '../../../package.json';
import { styled } from '@/stitches.config';

const StyledLoadingScreen = styled(Stack, {
  background: '$loadingScreenBg',
  height: '100vh',
  color: '$loadingScreenFg',
});

const StyledLoadingButton = styled('button', {
  textDecoration: 'underline',
  color: '$loadingScreenFgMuted',
  '&:hover, &:focus': {
    color: '$loadingScreenFg',
  },
});

type Props = PropsWithChildren<{
  isLoading?: boolean
  label?: string
  onCancel?: () => void
}>;

export default function FigmaLoading({
  isLoading, label, onCancel, children,
}: Props) {
  const { t } = useTranslation(['startScreen']);

  if (!isLoading) {
    return (
      <Box>
        {children}
      </Box>
    );
  }

  return (
    <StyledLoadingScreen data-testid="figmaloading" justify="center" direction="column" gap={4} className="content scroll-container">
      <Stack direction="column" gap={4} align="center">
        <Stack direction="column" gap={4} align="center">
          <FigmaMark />
          <FigmaLetter />
        </Stack>
        <Stack direction="column" gap={4} align="center" css={{ color: '$loadingScreenFgMuted' }}>
          {t('version')}
          {' '}
          {pjs.version}
        </Stack>
        <Stack direction="row" gap={4} justify="center" align="center">
          <Spinner onAccent />
          <Stack direction="column" gap={4} justify="center" align="center">
            {label ?? t('loadingWait')}
          </Stack>
        </Stack>
        <Stack direction="row" gap={4}>
          <StyledLoadingButton type="button" onClick={onCancel}>{t('cancel')}</StyledLoadingButton>
        </Stack>
      </Stack>
    </StyledLoadingScreen>
  );
}