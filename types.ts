import { Vector3 } from 'three';

export enum AppMode {
  GALLERY = 'GALLERY',
  MODEL = 'MODEL',
  SPIRAL = 'SPIRAL',
  GRAVITY = 'GRAVITY'
}

export enum GestureType {
  NONE = 'NONE',
  OPEN = 'OPEN',
  FIST = 'FIST',
  VICTORY = 'VICTORY',
  PINCH = 'PINCH'
}

export enum ModelType {
  HEART = 'HEART',
  PYRAMID = 'PYRAMID',
  TORUS = 'TORUS',
  SATURN = 'SATURN',
  DIAMOND = 'DIAMOND',
  ATOM = 'ATOM',
  VORTEX = 'VORTEX',
  HOURGLASS = 'HOURGLASS',
  DNA = 'DNA',
  SPHERE = 'SPHERE',
  CYLINDER = 'CYLINDER',
  MOBIUS = 'MOBIUS',
  CUBE = 'CUBE',
  STAR = 'STAR',
  KNOT = 'KNOT',
  FLOWER = 'FLOWER',
  KLEIN = 'KLEIN',
  CONE = 'CONE',
  SHELL = 'SHELL',
  KNOT_CN = 'KNOT_CN',
  TREE = 'TREE'
}

export interface ParticleImage {
  id: string;
  img: HTMLImageElement;
  name: string;
}

export interface HandState {
  present: boolean;
  position: Vector3;
  gesture: GestureType;
}

export interface ShapeData {
  [key: string]: number[];
}